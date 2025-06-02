import express from 'express';
import { SuccessResponse } from '../../core/ApiResponse';
import { ProtectedRequest } from 'app-request';
import { BadRequestError, NotFoundError } from '../../core/ApiError';
import validator, { ValidationSource } from '../../helpers/validator';
import schema from './schema';
import asyncHandler from '../../helpers/asyncHandler';
import authentication from '../../auth/authentication';
import { Types } from 'mongoose';
import DocumentRepo from '../../database/repository/DocumentRepo';
import { upload } from '../../helpers/upload';
import { parseMetadata } from '../../auth/parseMetaData';
import { FileModel } from '../../database/model/File';
import { uploadToGridFS } from '../../helpers/gridfs';
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import {
  processPDFTemplate,
  processDOCXTemplate,
  processTextTemplate,
} from '../../helpers/documentProcessor';

const router = express.Router();

/*-------------------------------------------------------------------------*/
// Below all routes require authenticated user
/*-------------------------------------------------------------------------*/
router.use(authentication);

// Upload document
router.post(
  '/',
  upload.single('file'),
  parseMetadata,
  validator(schema.uploadDocument),
  asyncHandler(async (req: ProtectedRequest, res) => {
    if (!req.file) throw new BadRequestError('No file uploaded');
    // Use the GridFS helper
    const gridfsResult = await uploadToGridFS({
      buffer: req.file.buffer,
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      uploadedBy: req.user._id.toString(),
    });

    try {
      // Save file metadata in your File collection
      const savedFile = await FileModel.create({
        filename: gridfsResult.filename,
        mimetype: gridfsResult.contentType,
        size: gridfsResult.length,
        uploadedBy: new Types.ObjectId(req.user._id),
      });

      // Save document metadata
      const document = await DocumentRepo.create({
        title: req.body.metadata.title,
        description: req.body.metadata.description,
        fileUrl: `gridfs://${gridfsResult.fileId}`,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        category: req.body.metadata.category,
        tags: req.body.metadata.tags || [],
        visibility: req.body.metadata.visibility,
        createdBy: req.user._id as unknown as Types.ObjectId,
      });

      // Optionally link file to document
      savedFile.documentId = document._id;
      await savedFile.save();
      new SuccessResponse('Document uploaded successfully', document).send(res);
    } catch (error) {
      console.error('Error saving file or document:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
      throw error;
    }
  }),
);

// Upload document template
router.post(
  '/templates',
  upload.single('file'),
  parseMetadata,
  validator(schema.uploadDocument),
  asyncHandler(async (req: ProtectedRequest, res) => {
    if (!req.file) throw new BadRequestError('No file uploaded');

    // Use the GridFS helper
    const gridfsResult = await uploadToGridFS({
      buffer: req.file.buffer,
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      uploadedBy: req.user._id.toString(),
    });

    try {
      // Save file metadata in your File collection
      const savedFile = await FileModel.create({
        filename: gridfsResult.filename,
        mimetype: gridfsResult.contentType,
        size: gridfsResult.length,
        uploadedBy: new Types.ObjectId(req.user._id),
      });

      // Save document metadata with isTemplate flag
      const document = await DocumentRepo.create({
        title: req.body.metadata.title,
        description: req.body.metadata.description,
        fileUrl: `gridfs://${gridfsResult.fileId}`,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        category: req.body.metadata.category,
        tags: req.body.metadata.tags || [],
        visibility: req.body.metadata.visibility,
        isTemplate: true, // Mark as template
        createdBy: req.user._id as unknown as Types.ObjectId,
      });

      // Link file to document
      savedFile.documentId = document._id;
      await savedFile.save();

      new SuccessResponse('Template uploaded successfully', document).send(res);
    } catch (error) {
      console.error('Error saving template:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
      throw error;
    }
  }),
);

// Generate document from template
router.post(
  '/generate',
  validator(schema.generateDocument),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const template = await DocumentRepo.findById(
      new Types.ObjectId(req.body.templateId),
    );
    if (!template || !template.isTemplate) {
      throw new NotFoundError('Template not found');
    }

    // Extract file ID from GridFS URL
    const fileId = template.fileUrl.replace('gridfs://', '');
    if (!fileId) {
      throw new BadRequestError('Invalid template file URL');
    }

    // Get the GridFS bucket
    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db);

    // Read the template file from GridFS
    const downloadStream = bucket.openDownloadStream(
      new Types.ObjectId(fileId),
    );
    const chunks: Buffer[] = [];

    // Collect the file chunks
    await new Promise((resolve, reject) => {
      downloadStream.on('data', (chunk) => chunks.push(chunk));
      downloadStream.on('end', resolve);
      downloadStream.on('error', reject);
    });

    const templateBuffer = Buffer.concat(chunks);
    let processedDocument;

    // Process the template based on file type
    switch (template.fileType) {
      case 'application/pdf':
        processedDocument = await processPDFTemplate(
          templateBuffer,
          req.body.data,
        );
        break;

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        processedDocument = await processDOCXTemplate(
          templateBuffer,
          req.body.data,
        );
        break;

      case 'text/plain':
        processedDocument = await processTextTemplate(
          templateBuffer,
          req.body.data,
        );
        break;

      default:
        throw new BadRequestError('Unsupported template file type');
    }

    // Generate filename for the new document
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${
      template.title
    }-${timestamp}.${req.body.outputFormat.toLowerCase()}`;

    // Upload the processed document to GridFS
    const gridfsResult = await uploadToGridFS({
      buffer: processedDocument.buffer,
      filename,
      mimetype: processedDocument.contentType,
      uploadedBy: req.user._id.toString(),
    });

    // Save file metadata
    const savedFile = await FileModel.create({
      filename: gridfsResult.filename,
      mimetype: gridfsResult.contentType,
      size: gridfsResult.length,
      uploadedBy: new Types.ObjectId(req.user._id),
    });

    // Create the new document
    const document = await DocumentRepo.create({
      title: `${template.title} - Generated`,
      description: `Generated from template: ${template.title}`,
      fileUrl: `gridfs://${gridfsResult.fileId}`,
      fileType: gridfsResult.contentType,
      fileSize: gridfsResult.length,
      category: template.category,
      tags: template.tags,
      visibility: template.visibility,
      createdBy: req.user._id as unknown as Types.ObjectId,
    });

    // Link file to document
    savedFile.documentId = document._id;
    await savedFile.save();

    new SuccessResponse('Document generated successfully', document).send(res);
  }),
);

// List document templates
router.get(
  '/templates',
  validator(schema.listTemplates),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { documents, total } = await DocumentRepo.findTemplates({
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      category: req.query.category as string,
      search: req.query.search as string,
    });

    if (documents.length === 0) {
      throw new NotFoundError('No templates found');
    }

    new SuccessResponse('success', {
      documents,
      total,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
    }).send(res);
  }),
);

// Get document by ID
router.get(
  '/:id',
  validator(schema.documentId, ValidationSource.PARAM),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const document = await DocumentRepo.findById(
      new Types.ObjectId(req.params.id),
    );
    if (!document) throw new NotFoundError('Document not found');

    // Check visibility
    if (
      document.visibility === 'PRIVATE' &&
      document.createdBy.toString() !== req.user._id.toString()
    ) {
      throw new BadRequestError(
        'You do not have permission to access this document',
      );
    }

    new SuccessResponse('success', document).send(res);
  }),
);

// Update document metadata
router.put(
  '/:id/metadata',
  parseMetadata,
  validator(schema.updateMetadata),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const document = await DocumentRepo.findById(
      new Types.ObjectId(req.params.id),
    );
    if (!document) throw new NotFoundError('Document not found');

    // Check ownership
    if (document.createdBy.toString() !== req.user._id.toString()) {
      throw new BadRequestError(
        'You do not have permission to update this document',
      );
    }

    const updatedDocument = await DocumentRepo.updateMetadata(
      new Types.ObjectId(req.params.id),
      req.body.metadata,
    );

    new SuccessResponse(
      'Document metadata updated successfully',
      updatedDocument,
    ).send(res);
  }),
);

export default router;

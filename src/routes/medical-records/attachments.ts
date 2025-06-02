import { Router } from 'express';
import { MedicalRecordModel } from '../../database/model/MedicalRecord';
import { NotFoundError } from '../../core/ApiError';
import upload from '../../helpers/upload';
import { ProtectedRequest } from '../../types/app-request';
import asyncHandler from '../../helpers/asyncHandler';
import { uploadToGridFS } from '../../helpers/gridfs';
import { FileModel } from '../../database/model/File';
import { Types } from 'mongoose';

const router = Router({ mergeParams: true });
/**
 * @route POST /api/medical-records/:id/attachments
 * @desc Add documents/images to a medical record
 * @access Private
 */
router.post(
  '/',
  upload.array('attachments', 5), // Allow up to 5 files
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const medicalRecord = await MedicalRecordModel.findById(id);
    if (!medicalRecord) {
      throw new NotFoundError('Medical record not found');
    }

    // Upload files to GridFS and save metadata
    const uploadPromises = files.map(async (file) => {
      const gridfsResult = await uploadToGridFS({
        buffer: file.buffer,
        filename: file.originalname,
        mimetype: file.mimetype,
        uploadedBy: req.user._id.toString(),
      });

      // Save file metadata
      await FileModel.create({
        filename: gridfsResult.filename,
        mimetype: gridfsResult.contentType,
        size: gridfsResult.length,
        uploadedBy: new Types.ObjectId(req.user._id),
      });

      return `gridfs://${gridfsResult.fileId}`;
    });

    const fileUrls = await Promise.all(uploadPromises);

    // Add new attachments to the existing ones
    medicalRecord.attachments = [
      ...(medicalRecord.attachments || []),
      ...fileUrls,
    ];

    // Ensure createdBy is set if it's not already
    if (!medicalRecord.createdBy) {
      medicalRecord.createdBy = req.user._id;
    }

    await medicalRecord.save();

    res.json({
      message: 'Attachments added successfully',
      attachments: medicalRecord.attachments,
    });
  }),
);

/**
 * @route GET /api/medical-records/:id/attachments
 * @desc List all attachments for a medical record
 * @access Private
 */
router.get(
  '/',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { id } = req.params;

    const medicalRecord = await MedicalRecordModel.findById(id);
    if (!medicalRecord) {
      throw new NotFoundError('Medical record not found');
    }

    res.json({
      attachments: medicalRecord.attachments || [],
    });
  }),
);

export default router;

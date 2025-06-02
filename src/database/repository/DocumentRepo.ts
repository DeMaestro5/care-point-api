import { Types } from 'mongoose';
import { InternalError } from '../../core/ApiError';
import { Document, DocumentModel } from '../model/Document';

async function create(
  data: Partial<Document> & { createdBy: Types.ObjectId },
): Promise<Document> {
  try {
    const document = await DocumentModel.create({
      ...data,
      createdBy: data.createdBy,
    });
    return document;
  } catch (error) {
    throw new InternalError('Error creating document');
  }
}

async function findById(id: Types.ObjectId): Promise<Document | null> {
  try {
    return await DocumentModel.findById(id);
  } catch (error) {
    throw new InternalError('Error finding document');
  }
}

async function updateMetadata(
  id: Types.ObjectId,
  metadata: Partial<Document>,
): Promise<Document | null> {
  try {
    return await DocumentModel.findByIdAndUpdate(
      id,
      { $set: metadata },
      { new: true },
    );
  } catch (error) {
    throw new InternalError('Error updating document metadata');
  }
}

async function findTemplates(query: {
  page: number;
  limit: number;
  category?: string;
  search?: string;
}): Promise<{ documents: Document[]; total: number }> {
  try {
    const filter: any = { isTemplate: true };
    if (query.category) filter.category = query.category;
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
      ];
    }

    const [documents, total] = await Promise.all([
      DocumentModel.find(filter)
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .sort({ createdAt: -1 }),
      DocumentModel.countDocuments(filter),
    ]);

    return { documents, total };
  } catch (error) {
    throw new InternalError('Error finding document templates');
  }
}

export default {
  create,
  findById,
  updateMetadata,
  findTemplates,
};

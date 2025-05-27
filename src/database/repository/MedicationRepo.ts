import { Types } from 'mongoose';
import Medication, { MedicationModel } from '../model/Medication';

async function findById(id: Types.ObjectId): Promise<Medication | null> {
  return MedicationModel.findById(id).lean();
}

async function search(
  query: string,
  page = 1,
  limit = 10,
): Promise<{ medications: Medication[]; total: number }> {
  const skip = (page - 1) * limit;
  const searchQuery = {
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { genericName: { $regex: query, $options: 'i' } },
      { category: { $regex: query, $options: 'i' } },
    ],
    status: true,
  };

  const [medications, total] = await Promise.all([
    MedicationModel.find(searchQuery)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    MedicationModel.countDocuments(searchQuery),
  ]);

  return { medications, total };
}

async function create(medication: Partial<Medication>): Promise<Medication> {
  const now = new Date();
  medication.createdAt = now;
  medication.updatedAt = now;
  const created = await MedicationModel.create(medication);
  return created.toObject();
}

async function update(
  id: Types.ObjectId,
  data: Partial<Medication>,
): Promise<Medication | null> {
  data.updatedAt = new Date();
  return MedicationModel.findByIdAndUpdate(id, data, { new: true }).lean();
}

async function getCategories(): Promise<string[]> {
  const categories = await MedicationModel.distinct('category', {
    status: true,
  });
  return categories.sort();
}

export default {
  findById,
  search,
  create,
  update,
  getCategories,
};

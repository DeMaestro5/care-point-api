import Pharmacy, { PharmacyModel } from '../model/Pharmacy';
import { Types } from 'mongoose';

async function findById(id: Types.ObjectId): Promise<Pharmacy | null> {
  return PharmacyModel.findOne({ _id: id, status: true })
    .populate('user', 'name email profilePicUrl')
    .lean()
    .exec();
}

async function findByUserId(userId: Types.ObjectId): Promise<Pharmacy | null> {
  return PharmacyModel.findOne({ user: userId, status: true })
    .populate('user', 'name email profilePicUrl')
    .lean()
    .exec();
}

async function create(pharmacy: Pharmacy): Promise<Pharmacy> {
  const now = new Date();
  pharmacy.createdAt = now;
  pharmacy.updatedAt = now;
  const created = await PharmacyModel.create(pharmacy);
  return created.toObject();
}

async function update(pharmacy: Pharmacy): Promise<Pharmacy | null> {
  pharmacy.updatedAt = new Date();
  return PharmacyModel.findByIdAndUpdate(pharmacy._id, pharmacy, { new: true })
    .lean()
    .exec();
}

export default {
  findById,
  findByUserId,
  create,
  update,
};

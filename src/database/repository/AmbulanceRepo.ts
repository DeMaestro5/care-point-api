import Ambulance, { AmbulanceModel } from '../model/Ambulance';
import { Types } from 'mongoose';

async function findById(id: Types.ObjectId): Promise<Ambulance | null> {
  return AmbulanceModel.findOne({ _id: id, status: true })
    .populate('user', 'name email profilePicUrl')
    .lean()
    .exec();
}

async function findByUserId(userId: Types.ObjectId): Promise<Ambulance | null> {
  return AmbulanceModel.findOne({ user: userId, status: true })
    .populate('user', 'name email profilePicUrl')
    .lean()
    .exec();
}

async function create(ambulance: Ambulance): Promise<Ambulance> {
  const now = new Date();
  ambulance.createdAt = now;
  ambulance.updatedAt = now;
  const created = await AmbulanceModel.create(ambulance);
  return created.toObject();
}

async function update(ambulance: Ambulance): Promise<Ambulance | null> {
  ambulance.updatedAt = new Date();
  return AmbulanceModel.findByIdAndUpdate(ambulance._id, ambulance, {
    new: true,
  })
    .lean()
    .exec();
}

export default {
  findById,
  findByUserId,
  create,
  update,
};

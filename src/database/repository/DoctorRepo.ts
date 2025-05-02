import Doctor, { DoctorModel } from '../model/Doctor';
import { Types } from 'mongoose';

async function findById(id: Types.ObjectId): Promise<Doctor | null> {
  return DoctorModel.findOne({ _id: id, status: true })
    .populate('user', 'name email profilePicUrl')
    .lean()
    .exec();
}

async function findByUserId(userId: Types.ObjectId): Promise<Doctor | null> {
  return DoctorModel.findOne({ user: userId, status: true })
    .populate('user', 'name email profilePicUrl')
    .lean()
    .exec();
}

async function create(doctor: Doctor): Promise<Doctor> {
  const now = new Date();
  doctor.createdAt = now;
  doctor.updatedAt = now;
  const created = await DoctorModel.create(doctor);
  return created.toObject();
}

async function update(doctor: Doctor): Promise<Doctor | null> {
  doctor.updatedAt = new Date();
  return DoctorModel.findByIdAndUpdate(doctor._id, doctor, { new: true })
    .lean()
    .exec();
}

export default {
  findById,
  findByUserId,
  create,
  update,
};

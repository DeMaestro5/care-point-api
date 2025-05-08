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

async function searchDoctors({
  page = 1,
  limit = 10,
  specialization,
  status,
  search,
}: {
  page?: number;
  limit?: number;
  specialization?: string;
  status?: boolean;
  search?: string;
}) {
  const query: any = { status: true };

  if (specialization) {
    query.specialization = { $regex: specialization, $options: 'i' };
  }

  if (typeof status === 'boolean') {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { specialization: { $regex: search, $options: 'i' } },
      { hospital: { $regex: search, $options: 'i' } },
      { qualification: { $regex: search, $options: 'i' } },
    ];
  }

  const [doctors, total] = await Promise.all([
    DoctorModel.find(query)
      .populate('user', 'name email profilePicUrl')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec(),
    DoctorModel.countDocuments(query),
  ]);

  return {
    doctors,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  };
}

export default {
  findById,
  findByUserId,
  create,
  update,
  searchDoctors,
};

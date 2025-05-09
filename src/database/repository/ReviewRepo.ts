import { Types } from 'mongoose';
import Review, { ReviewModel } from '../model/Review';

async function findByDoctorId(doctorId: Types.ObjectId): Promise<Review[]> {
  return ReviewModel.find({ doctor: doctorId })
    .populate('patient', 'name user')
    .populate('patient.user', 'name email')
    .sort({ createdAt: -1 })
    .lean()
    .exec() as Promise<Review[]>;
}

export default {
  findByDoctorId,
};

import { Types } from 'mongoose';
import { InsuranceClaim, IInsuranceClaim } from '../model/InsuranceClaim';

async function findById(id: Types.ObjectId): Promise<IInsuranceClaim | null> {
  return InsuranceClaim.findById(id)
    .populate('patientId', 'user')
    .populate('insuranceId')
    .lean();
}

async function findByPatientId(
  patientId: Types.ObjectId,
): Promise<IInsuranceClaim[]> {
  return InsuranceClaim.find({ patientId })
    .populate('insuranceId')
    .sort({ createdAt: -1 })
    .lean();
}

async function create(
  data: Partial<IInsuranceClaim>,
): Promise<IInsuranceClaim> {
  const claim = await InsuranceClaim.create(data);
  return claim;
}

async function update(
  id: Types.ObjectId,
  data: Partial<IInsuranceClaim>,
): Promise<IInsuranceClaim | null> {
  return InsuranceClaim.findByIdAndUpdate(id, data, { new: true }).lean();
}

async function findByStatus(
  status: string,
  page: number = 1,
  limit: number = 10,
): Promise<{ claims: IInsuranceClaim[]; total: number }> {
  const skip = (page - 1) * limit;
  const [claims, total] = await Promise.all([
    InsuranceClaim.find({ status })
      .populate('patientId', 'user')
      .populate('insuranceId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    InsuranceClaim.countDocuments({ status }),
  ]);

  return { claims: claims as unknown as IInsuranceClaim[], total };
}

export default {
  findById,
  findByPatientId,
  create,
  update,
  findByStatus,
};

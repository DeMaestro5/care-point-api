import { Types } from 'mongoose';
import { LabResult, ILabResult } from '../model/Laboratory';

async function findById(id: Types.ObjectId): Promise<ILabResult | null> {
  return LabResult.findById(id)
    .populate('labOrderId')
    .populate('technicianId', 'user')
    .lean()
    .exec() as Promise<ILabResult | null>;
}

async function findByLabOrderId(
  labOrderId: Types.ObjectId,
): Promise<ILabResult | null> {
  return LabResult.findOne({ labOrderId })
    .populate('technicianId', 'user')
    .lean()
    .exec() as Promise<ILabResult | null>;
}

async function findByTechnicianId(
  technicianId: Types.ObjectId,
  page = 1,
  limit = 10,
  filter: any = {},
): Promise<{ results: ILabResult[]; total: number }> {
  const skip = (page - 1) * limit;
  const [results, total] = await Promise.all([
    LabResult.find({ technicianId, ...filter })
      .populate('labOrderId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec() as Promise<ILabResult[]>,
    LabResult.countDocuments({ technicianId, ...filter }),
  ]);

  return { results, total };
}

async function create(data: Partial<ILabResult>): Promise<ILabResult> {
  const result = await LabResult.create(data);
  return result;
}

async function update(
  id: Types.ObjectId,
  data: Partial<ILabResult>,
): Promise<ILabResult | null> {
  return LabResult.findByIdAndUpdate(id, data, { new: true })
    .lean()
    .exec() as Promise<ILabResult | null>;
}

async function findByStatus(
  status: string,
  page = 1,
  limit = 10,
): Promise<{ results: ILabResult[]; total: number }> {
  const skip = (page - 1) * limit;
  const [results, total] = await Promise.all([
    LabResult.find({ status })
      .populate('labOrderId')
      .populate('technicianId', 'user')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec() as Promise<ILabResult[]>,
    LabResult.countDocuments({ status }),
  ]);

  return { results, total };
}

export default {
  findById,
  findByLabOrderId,
  findByTechnicianId,
  create,
  update,
  findByStatus,
};

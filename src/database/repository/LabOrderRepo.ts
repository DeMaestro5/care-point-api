import { Types } from 'mongoose';
import { LabOrder, ILabOrder } from '../model/Laboratory';

async function findById(id: Types.ObjectId): Promise<ILabOrder | null> {
  return LabOrder.findById(id)
    .populate('patientId', 'user')
    .populate('doctorId', 'user')
    .lean()
    .exec() as Promise<ILabOrder | null>;
}

async function findByPatientId(
  patientId: Types.ObjectId,
  page = 1,
  limit = 10,
  filter: any = {},
): Promise<{ orders: ILabOrder[]; total: number }> {
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    LabOrder.find({ patientId, ...filter })
      .populate('doctorId', 'user')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec() as Promise<ILabOrder[]>,
    LabOrder.countDocuments({ patientId, ...filter }),
  ]);

  return { orders, total };
}

async function findByDoctorId(
  doctorId: Types.ObjectId,
  page = 1,
  limit = 10,
  filter: any = {},
): Promise<{ orders: ILabOrder[]; total: number }> {
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    LabOrder.find({ doctorId, ...filter })
      .populate('patientId', 'user')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec() as Promise<ILabOrder[]>,
    LabOrder.countDocuments({ doctorId, ...filter }),
  ]);

  return { orders, total };
}

async function create(data: Partial<ILabOrder>): Promise<ILabOrder> {
  const order = await LabOrder.create(data);
  return order;
}

async function update(
  id: Types.ObjectId,
  data: Partial<ILabOrder>,
): Promise<ILabOrder | null> {
  return LabOrder.findByIdAndUpdate(id, data, { new: true })
    .lean()
    .exec() as Promise<ILabOrder | null>;
}

async function findByStatus(
  status: string,
  page = 1,
  limit = 10,
): Promise<{ orders: ILabOrder[]; total: number }> {
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    LabOrder.find({ status })
      .populate('patientId', 'user')
      .populate('doctorId', 'user')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec() as Promise<ILabOrder[]>,
    LabOrder.countDocuments({ status }),
  ]);

  return { orders, total };
}

export default {
  findById,
  findByPatientId,
  findByDoctorId,
  create,
  update,
  findByStatus,
};

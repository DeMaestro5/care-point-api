import { Types } from 'mongoose';
import Payment, { PaymentModel } from '../model/Payment';

async function findByPatientId(
  patientId: Types.ObjectId,
  page: number = 1,
  limit: number = 10,
): Promise<{ payments: Payment[]; total: number }> {
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    PaymentModel.find({ patientId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    PaymentModel.countDocuments({ patientId }),
  ]);

  return { payments, total };
}

async function findById(id: Types.ObjectId): Promise<Payment | null> {
  return PaymentModel.findById(id).lean();
}

async function create(data: Partial<Payment>): Promise<Payment> {
  const payment = await PaymentModel.create(data);
  return payment;
}

async function update(
  id: Types.ObjectId,
  data: Partial<Payment>,
): Promise<Payment | null> {
  return PaymentModel.findByIdAndUpdate(id, data, { new: true }).lean();
}

export default {
  findByPatientId,
  findById,
  create,
  update,
};

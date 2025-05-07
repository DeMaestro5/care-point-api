import { Types } from 'mongoose';
import { Insurance, IInsurance } from '../model/Insurance';

async function findById(id: Types.ObjectId): Promise<IInsurance | null> {
  return Insurance.findById(id).lean();
}

async function findByPatientId(
  patientId: Types.ObjectId,
): Promise<IInsurance | null> {
  return Insurance.findOne({ patientId }).lean();
}

async function create(data: Partial<IInsurance>): Promise<IInsurance> {
  const insurance = await Insurance.create(data);
  return insurance;
}

async function update(
  patientId: Types.ObjectId,
  data: Partial<IInsurance>,
): Promise<IInsurance | null> {
  return Insurance.findOneAndUpdate(
    { patientId },
    { ...data, patientId },
    { new: true, upsert: true },
  );
}

export default {
  findById,
  findByPatientId,
  create,
  update,
};

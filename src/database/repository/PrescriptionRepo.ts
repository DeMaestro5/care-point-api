import { Types } from 'mongoose';
import Prescription, { PrescriptionModel } from '../model/Prescription';

async function create(prescription: Prescription): Promise<Prescription> {
  const now = new Date();
  prescription.createdAt = prescription.updatedAt = now;
  const createdPrescription = await PrescriptionModel.create(prescription);
  return createdPrescription.toObject();
}

async function findById(id: Types.ObjectId): Promise<Prescription | null> {
  return PrescriptionModel.findOne({ _id: id, status: { $ne: 'CANCELLED' } })
    .lean<Prescription>()
    .exec();
}

async function findByPatientId(
  patientId: Types.ObjectId,
): Promise<Prescription[]> {
  return PrescriptionModel.find({
    patient: patientId,
    status: { $ne: 'CANCELLED' },
  })
    .sort({ createdAt: -1 })
    .lean<Prescription[]>()
    .exec();
}

async function update(
  id: Types.ObjectId,
  prescription: Partial<Prescription>,
): Promise<Prescription | null> {
  prescription.updatedAt = new Date();
  return PrescriptionModel.findByIdAndUpdate(id, prescription, { new: true })
    .lean<Prescription>()
    .exec();
}

async function deletePrescription(
  id: Types.ObjectId,
): Promise<Prescription | null> {
  return PrescriptionModel.findByIdAndUpdate(
    id,
    { status: 'CANCELLED', updatedAt: new Date() },
    { new: true },
  )
    .lean<Prescription>()
    .exec();
}

export default {
  create,
  findById,
  findByPatientId,
  update,
  delete: deletePrescription,
};

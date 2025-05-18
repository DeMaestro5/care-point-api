import { Types } from 'mongoose';
import Prescription, { PrescriptionModel } from '../model/Prescription';

async function create(prescription: Prescription): Promise<Prescription> {
  const now = new Date();
  prescription.createdAt = prescription.updatedAt = now;
  const createdPrescription = await PrescriptionModel.create(prescription);
  return createdPrescription.toObject();
}

async function findById(id: Types.ObjectId): Promise<Prescription | null> {
  console.log(id);
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

async function findByPharmacyId(
  pharmacyId: Types.ObjectId,
  filter: any,
  skip: number,
  limit: number,
): Promise<Prescription[]> {
  return PrescriptionModel.find({
    pharmacy: pharmacyId,
    ...filter,
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: 'patient',
      select: 'name email dateOfBirth gender bloodGroup',
      populate: {
        path: 'user',
        select: 'name email profilePicUrl',
      },
    })
    .populate({
      path: 'doctor',
      select: 'name email specialization licenseNumber',
      populate: {
        path: 'user',
        select: 'name email profilePicUrl',
      },
    })
    .lean<Prescription[]>()
    .exec();
}

async function countByPharmacyId(
  pharmacyId: Types.ObjectId,
  filter: any,
): Promise<number> {
  return PrescriptionModel.countDocuments({
    pharmacy: pharmacyId,
    ...filter,
  }).exec();
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

async function find(
  filter: any,
  skip: number,
  limit: number,
): Promise<Prescription[]> {
  return PrescriptionModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('patient', 'name email')
    .populate('doctor', 'name email')
    .populate('pharmacy', 'name')
    .lean<Prescription[]>()
    .exec();
}

async function count(filter: any): Promise<number> {
  return PrescriptionModel.countDocuments(filter).exec();
}

export default {
  create,
  findById,
  findByPatientId,
  findByPharmacyId,
  countByPharmacyId,
  update,
  delete: deletePrescription,
  find,
  count,
};

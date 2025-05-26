import { Types } from 'mongoose';
import { MedicalRecordModel } from '../model/MedicalRecord';
import MedicalRecord from '../model/MedicalRecord';

async function findByPatientId(patientId: Types.ObjectId) {
  return MedicalRecordModel.find({ patient: patientId })
    .sort({ recordDate: -1 })
    .lean()
    .exec();
}

async function findById(id: Types.ObjectId) {
  return MedicalRecordModel.findById(id).lean().exec();
}

async function create(
  patientId: Types.ObjectId,
  doctorId: Types.ObjectId,
  data: {
    diagnosis: string;
    treatment: string;
    notes?: string;
    attachments?: string[];
  },
) {
  const medicalRecord = await MedicalRecordModel.create({
    patient: patientId,
    createdBy: doctorId,
    diagnosis: data.diagnosis,
    treatment: data.treatment,
    notes: data.notes,
    attachments: data.attachments,
    recordDate: new Date(),
  });

  return medicalRecord.toObject();
}

async function update(id: Types.ObjectId, data: Partial<MedicalRecord>) {
  return MedicalRecordModel.findByIdAndUpdate(
    id,
    { $set: { ...data, updatedAt: new Date() } },
    { new: true },
  )
    .lean()
    .exec();
}

async function deleteRecord(id: Types.ObjectId) {
  return MedicalRecordModel.findByIdAndDelete(id).exec();
}

async function searchMedicalRecords(
  patientId: Types.ObjectId,
  {
    page = 1,
    limit = 10,
    startDate,
    endDate,
  }: {
    page?: number;
    limit?: number;
    startDate?: Date;
    endDate?: Date;
  },
) {
  const query: any = { patient: patientId };

  if (startDate || endDate) {
    query.recordDate = {};
    if (startDate) query.recordDate.$gte = startDate;
    if (endDate) query.recordDate.$lte = endDate;
  }

  const [records, total] = await Promise.all([
    MedicalRecordModel.find(query)
      .sort({ recordDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec(),
    MedicalRecordModel.countDocuments(query),
  ]);

  return {
    records,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  };
}

export default {
  findByPatientId,
  findById,
  create,
  update,
  delete: deleteRecord,
  searchMedicalRecords,
};

import { Types } from 'mongoose';
import { VitalSignsModel } from '../model/VitalSigns';
import VitalSigns from '../model/VitalSigns';

type VitalSignsDocument = {
  _id: Types.ObjectId;
  patient: Types.ObjectId;
  recordedBy: Types.ObjectId;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  notes?: string;
  recordedAt: Date;
};

async function create(
  patientId: Types.ObjectId,
  recordedBy: Types.ObjectId,
  data: Partial<VitalSigns>,
): Promise<VitalSigns> {
  const vitalSigns = new VitalSignsModel({
    patient: patientId,
    recordedBy,
    ...data,
  });
  return await vitalSigns.save();
}

async function findById(id: Types.ObjectId): Promise<VitalSigns | null> {
  return await VitalSignsModel.findById(id)
    .populate('recordedBy', 'name email')
    .lean();
}

async function findByPatientId(
  patientId: Types.ObjectId,
  options: {
    page?: number;
    limit?: number;
    startDate?: Date;
    endDate?: Date;
  } = {},
): Promise<{ vitalSigns: VitalSignsDocument[]; total: number }> {
  const { page = 1, limit = 10, startDate, endDate } = options;
  const skip = (page - 1) * limit;

  const query: any = { patient: patientId };
  if (startDate || endDate) {
    query.recordedAt = {};
    if (startDate) query.recordedAt.$gte = startDate;
    if (endDate) query.recordedAt.$lte = endDate;
  }

  const [vitalSigns, total] = await Promise.all([
    VitalSignsModel.find(query)
      .sort({ recordedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('recordedBy', 'name email')
      .lean(),
    VitalSignsModel.countDocuments(query),
  ]);

  return { vitalSigns, total };
}

async function update(
  id: Types.ObjectId,
  data: Partial<VitalSigns>,
): Promise<VitalSigns | null> {
  return await VitalSignsModel.findByIdAndUpdate(id, data, { new: true })
    .populate('recordedBy', 'name email')
    .lean();
}

async function deleteVitalSigns(
  id: Types.ObjectId,
): Promise<VitalSigns | null> {
  return await VitalSignsModel.findByIdAndDelete(id).lean();
}

export default {
  create,
  findById,
  findByPatientId,
  update,
  deleteVitalSigns,
};

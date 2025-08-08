import Patient, { PatientModel } from '../model/Patient';
import { Types } from 'mongoose';

async function findById(id: Types.ObjectId): Promise<Patient | null> {
  let patient = await PatientModel.findOne({ _id: id, status: true })
    .populate('user', 'name email profilePicUrl')
    .lean()
    .exec();

  if (!patient) {
    patient = await PatientModel.findOne({ user: id, status: true })
      .populate('user', 'name email profilePicUrl')
      .lean()
      .exec();
  }

  console.log(
    `Final patient result with status filter: ${
      patient ? 'Found' : 'Not found'
    }`,
  );

  return patient;
}

async function findByUserId(userId: Types.ObjectId): Promise<Patient | null> {
  const patient = await PatientModel.findOne({ user: userId, status: true })
    .populate('user', 'name email profilePicUrl')
    .lean()
    .exec();
  return patient;
}

async function create(patient: Patient): Promise<Patient> {
  const now = new Date();
  patient.createdAt = now;
  patient.updatedAt = now;
  patient.status = true;

  const created = await PatientModel.create(patient);
  return created.toObject();
}

async function update(patient: Partial<Patient>): Promise<Patient | null> {
  return PatientModel.findByIdAndUpdate(
    patient._id,
    {
      $set: {
        allergies: patient.allergies,
        updatedAt: new Date(),
      },
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .lean()
    .exec();
}

async function logAccess(
  patientId: Types.ObjectId,
  userId: Types.ObjectId,
  action: string,
): Promise<void> {
  await PatientModel.updateOne(
    { _id: patientId },
    { $push: { accessLogs: { userId, action, timestamp: new Date() } } },
  );
}

async function addMedicalHistory(patientId: Types.ObjectId, entry: any) {
  return PatientModel.findByIdAndUpdate(
    patientId,
    { $push: { medicalHistory: entry } },
    { new: true },
  )
    .lean()
    .exec();
}

async function updateMedicalHistoryEntry(
  patientId: Types.ObjectId,
  entryId: Types.ObjectId,
  update: any,
) {
  return PatientModel.findOneAndUpdate(
    { _id: patientId, 'medicalHistory.entryId': entryId },
    { $set: { 'medicalHistory.$': update } },
    { new: true },
  )
    .lean()
    .exec();
}

async function getMedicalHistory(patientId: Types.ObjectId) {
  return PatientModel.findById(patientId)
    .select('medicalHistory')
    .lean()
    .exec();
}

async function findByDoctorId(doctorId: Types.ObjectId): Promise<Patient[]> {
  return PatientModel.find({ doctor: doctorId, status: true })
    .populate('user', 'name email profilePicUrl')
    .lean()
    .exec();
}

async function count(filters: any = {}): Promise<number> {
  return PatientModel.countDocuments(filters).exec();
}

export default {
  findById,
  findByUserId,
  create,
  update,
  logAccess,
  addMedicalHistory,
  updateMedicalHistoryEntry,
  getMedicalHistory,
  findByDoctorId,
  count,
};

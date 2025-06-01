import Patient, { PatientModel } from '../model/Patient';
import { Types } from 'mongoose';

// Enhanced findById with debug logging
async function findById(id: Types.ObjectId): Promise<Patient | null> {
  console.log(`Finding patient by ID: ${id}, type: ${typeof id}`);

  // Try finding by patient ID first
  let patient = await PatientModel.findOne({ _id: id, status: true })
    .populate('user', 'name email profilePicUrl')
    .lean()
    .exec();

  // If not found, try finding by user ID
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
  console.log(`Finding patient by User ID: ${userId}`);

  // Check if patient exists with this user ID regardless of status
  const patientExists = await PatientModel.exists({ user: userId });
  console.log(`Patient with user ID exists check: ${patientExists}`);

  // Find without status filter
  const patientWithoutStatus = await PatientModel.findOne({ user: userId })
    .populate('user', 'name email profilePicUrl')
    .lean()
    .exec();
  console.log(
    `Patient by user ID without status: ${
      patientWithoutStatus ? 'Found' : 'Not found'
    }`,
  );

  // Original query
  const patient = await PatientModel.findOne({ user: userId, status: true })
    .populate('user', 'name email profilePicUrl')
    .lean()
    .exec();

  console.log(
    `Final patient result by user ID: ${patient ? 'Found' : 'Not found'}`,
  );

  return patient;
}

async function create(patient: Patient): Promise<Patient> {
  const now = new Date();
  patient.createdAt = now;
  patient.updatedAt = now;

  // Make sure status is explicitly set to true
  patient.status = true;

  console.log(`Creating patient:`, patient);
  const created = await PatientModel.create(patient);
  console.log(`Created patient with ID: ${created._id}`);
  return created.toObject();
}

// Modified update function for PatientRepo.ts

async function update(patient: Partial<Patient>): Promise<Patient | null> {
  console.log(`Updating patient with ID: ${patient._id}`);

  // Use $set operator to update only the specified fields
  // This prevents overwriting other fields that might be required
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

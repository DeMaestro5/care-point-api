import { Types } from 'mongoose';
import TelemedicineSession, {
  TelemedicineSessionModel,
} from '../model/TelemedicineSession';

async function create(
  session: Partial<TelemedicineSession>,
): Promise<TelemedicineSession> {
  const createdSession = await TelemedicineSessionModel.create(session);
  return createdSession.toObject() as TelemedicineSession;
}

async function findById(
  id: Types.ObjectId,
): Promise<TelemedicineSession | null> {
  const session = await TelemedicineSessionModel.findById(id)
    .populate('prescription')
    .lean()
    .exec();
  return session as TelemedicineSession | null;
}

async function findByPatientId(
  patientId: Types.ObjectId,
): Promise<TelemedicineSession[]> {
  const sessions = await TelemedicineSessionModel.find({ patient: patientId })
    .populate({
      path: 'doctor',
      select: 'name specialization user hospital',
      populate: {
        path: 'user',
        select: 'name email profilePicUrl',
      },
    })
    .sort({ startTime: -1 })
    .lean()
    .exec();
  return sessions as TelemedicineSession[];
}

async function findByDoctorId(
  doctorId: Types.ObjectId,
): Promise<TelemedicineSession[]> {
  const sessions = await TelemedicineSessionModel.find({ doctor: doctorId })
    .populate({
      path: 'patient',
      select: 'name user dateOfBirth gender',
      populate: {
        path: 'user',
        select: 'name email profilePicUrl',
      },
    })
    .sort({ startTime: -1 })
    .lean()
    .exec();
  return sessions as TelemedicineSession[];
}

async function update(
  id: Types.ObjectId,
  data: Partial<TelemedicineSession>,
): Promise<TelemedicineSession | null> {
  const session = await TelemedicineSessionModel.findByIdAndUpdate(
    id,
    { $set: { ...data, updatedAt: new Date() } },
    { new: true },
  )
    .populate({
      path: 'patient',
      select: 'name user dateOfBirth gender',
      populate: {
        path: 'user',
        select: 'name email profilePicUrl',
      },
    })
    .populate({
      path: 'doctor',
      select: 'name specialization user hospital',
      populate: {
        path: 'user',
        select: 'name email profilePicUrl',
      },
    })
    .populate('prescription')
    .lean()
    .exec();
  return session as TelemedicineSession | null;
}

async function deleteById(
  id: Types.ObjectId,
): Promise<TelemedicineSession | null> {
  const session = await TelemedicineSessionModel.findByIdAndDelete(id)
    .lean()
    .exec();
  return session as TelemedicineSession | null;
}

export default {
  create,
  findById,
  findByPatientId,
  findByDoctorId,
  update,
  delete: deleteById,
};

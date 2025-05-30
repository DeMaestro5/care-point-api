import { Types } from 'mongoose';
import { InternalError } from '../../core/ApiError';
import Referral, { IReferral } from '../../database/model/Referral';

async function create(data: Partial<IReferral>): Promise<IReferral> {
  try {
    const referral = await Referral.create(data);
    return referral;
  } catch (error) {
    throw new InternalError('Error creating referral');
  }
}

async function findById(id: Types.ObjectId): Promise<IReferral | null> {
  try {
    return await Referral.findById(id);
  } catch (error) {
    throw new InternalError('Error finding referral');
  }
}

async function update(
  id: Types.ObjectId,
  data: Partial<IReferral>,
): Promise<IReferral | null> {
  try {
    return await Referral.findByIdAndUpdate(id, data, { new: true });
  } catch (error) {
    throw new InternalError('Error updating referral');
  }
}

async function findByDoctorId(
  doctorId: Types.ObjectId,
): Promise<{ referrals: IReferral[] }> {
  try {
    const referrals = await Referral.find({ referredTo: doctorId });
    return { referrals };
  } catch (error) {
    throw new InternalError('Error finding doctor referrals');
  }
}

async function findByPatientId(
  patientId: Types.ObjectId,
): Promise<{ referrals: IReferral[] }> {
  try {
    const referrals = await Referral.find({ patientId });
    return { referrals };
  } catch (error) {
    throw new InternalError('Error finding patient referrals');
  }
}

export default {
  create,
  findById,
  update,
  findByDoctorId,
  findByPatientId,
};

import { Types } from 'mongoose';
import EmergencyRequest from '../../database/model/EmergencyRequest';
import { EmergencyRequestModel } from '../../database/model/EmergencyRequest';

async function create(data: {
  patient: Types.ObjectId;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}): Promise<EmergencyRequest> {
  const emergencyRequest = await EmergencyRequestModel.create({
    ...data,
    status: 'PENDING',
    createdAt: new Date(),
  });
  return emergencyRequest;
}

async function findById(id: Types.ObjectId): Promise<EmergencyRequest | null> {
  return EmergencyRequestModel.findById(id);
}

export default {
  create,
  findById,
};

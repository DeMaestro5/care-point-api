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

async function update(id: Types.ObjectId, data: Partial<EmergencyRequest>) {
  return EmergencyRequestModel.findByIdAndUpdate(id, data, { new: true });
}

async function findNearBy(
  latitude: number,
  longitude: number,
  maxDistanceInKm: number = 10,
): Promise<EmergencyRequest[]> {
  // Convert the location to GeoJSON point
  const point = {
    type: 'Point',
    coordinates: [longitude, latitude], // MongoDB uses [longitude, latitude] order
  };

  // Create a geospatial index if it doesn't exist
  await EmergencyRequestModel.collection.createIndex({
    'location.coordinates': '2dsphere',
  });

  return EmergencyRequestModel.find({
    status: 'PENDING',
    'location.coordinates': {
      $near: {
        $geometry: point,
        $maxDistance: maxDistanceInKm * 1000, // Convert km to meters
      },
    },
  })
    .populate('patient', 'name contactNumber')
    .sort({ priority: -1, createdAt: 1 }) // Sort by priority (HIGH first) and then by creation time
    .exec();
}

export default {
  create,
  findById,
  update,
  findNearBy,
};

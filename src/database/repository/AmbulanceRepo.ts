import Ambulance, { AmbulanceModel } from '../model/Ambulance';
import { Types } from 'mongoose';

async function findById(id: Types.ObjectId): Promise<Ambulance | null> {
  return AmbulanceModel.findOne({ _id: id, status: true })
    .populate('user', 'name email profilePicUrl')
    .lean()
    .exec();
}
async function findAll(): Promise<Ambulance[]> {
  return AmbulanceModel.find({ status: true })
    .populate('user', 'name email profilePicUrl')
    .lean()
    .exec();
}
async function findByUserId(userId: Types.ObjectId): Promise<Ambulance | null> {
  return AmbulanceModel.findOne({ user: userId, status: true })
    .populate('user', 'name email profilePicUrl')
    .lean()
    .exec();
}

async function create(ambulance: Ambulance): Promise<Ambulance> {
  const now = new Date();
  ambulance.createdAt = now;
  ambulance.updatedAt = now;
  const created = await AmbulanceModel.create(ambulance);
  return created.toObject();
}

async function update(ambulance: Ambulance): Promise<Ambulance | null> {
  ambulance.updatedAt = new Date();
  return AmbulanceModel.findByIdAndUpdate(ambulance._id, ambulance, {
    new: true,
  })
    .lean()
    .exec();
}

async function addCoverage(
  ambulanceId: Types.ObjectId,
  coverage: {
    area: string;
    radius: number;
    priority: number;
    operatingHours: {
      day: string;
      startTime: string;
      endTime: string;
    }[];
    restrictions: string[];
    notes?: string;
    isActive: boolean;
  },
): Promise<Ambulance | null> {
  const now = new Date();
  const coverageWithTimestamps = {
    ...coverage,
    createdAt: now,
    updatedAt: now,
  };

  return AmbulanceModel.findByIdAndUpdate(
    ambulanceId,
    { $push: { coverage: coverageWithTimestamps } },
    { new: true },
  )
    .lean()
    .exec();
}

async function updateCoverage(
  ambulanceId: Types.ObjectId,
  coverageId: string,
  updates: {
    area?: string;
    radius?: number;
    priority?: number;
    operatingHours?: {
      day: string;
      startTime: string;
      endTime: string;
    }[];
    restrictions?: string[];
    notes?: string;
    isActive?: boolean;
  },
): Promise<Ambulance | null> {
  const updateFields: Record<string, any> = {};
  Object.keys(updates).forEach((key) => {
    if (updates[key as keyof typeof updates] !== undefined) {
      updateFields[`coverage.$.${key}`] = updates[key as keyof typeof updates];
    }
  });
  updateFields['coverage.$.updatedAt'] = new Date();

  return AmbulanceModel.findOneAndUpdate(
    {
      _id: ambulanceId,
      'coverage._id': new Types.ObjectId(coverageId),
    },
    { $set: updateFields },
    { new: true },
  )
    .lean()
    .exec();
}

async function deleteCoverage(
  ambulanceId: Types.ObjectId,
  coverageId: string,
): Promise<Ambulance | null> {
  return AmbulanceModel.findByIdAndUpdate(
    ambulanceId,
    { $pull: { coverage: { _id: new Types.ObjectId(coverageId) } } },
    { new: true },
  )
    .lean()
    .exec();
}

async function getCoverageById(
  ambulanceId: Types.ObjectId,
  coverageId: string,
): Promise<Ambulance | null> {
  return AmbulanceModel.findOne({
    _id: ambulanceId,
    'coverage._id': new Types.ObjectId(coverageId),
  })
    .lean()
    .exec();
}

export default {
  addCoverage,
  updateCoverage,
  deleteCoverage,
  getCoverageById,
  findAll,
  findById,
  findByUserId,
  create,
  update,
};

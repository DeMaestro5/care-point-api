import Device, { DeviceModel } from '../model/Device';
import { Types } from 'mongoose';

async function create(deviceData: {
  user: Types.ObjectId;
  deviceId: string;
  deviceType: 'IOS' | 'ANDROID';
  deviceName?: string;
  pushToken?: string;
  appVersion?: string;
  osVersion?: string;
  metadata?: Record<string, any>;
}): Promise<Device> {
  const now = new Date();
  const device = new DeviceModel({
    ...deviceData,
    lastActiveAt: now,
    createdAt: now,
    updatedAt: now,
  });
  return await device.save();
}

async function findById(id: Types.ObjectId): Promise<Device | null> {
  return await DeviceModel.findById(id)
    .populate('user', 'name email role')
    .lean();
}

async function findByDeviceId(deviceId: string): Promise<Device | null> {
  return await DeviceModel.findOne({ deviceId })
    .populate('user', 'name email role')
    .lean();
}

async function findByUserId(userId: Types.ObjectId): Promise<Device[]> {
  return await DeviceModel.find({ user: userId, isActive: true })
    .populate('user', 'name email role')
    .sort({ lastActiveAt: -1 })
    .lean();
}

async function findByPushToken(pushToken: string): Promise<Device | null> {
  return await DeviceModel.findOne({ pushToken, isActive: true })
    .populate('user', 'name email role')
    .lean();
}

async function update(
  id: Types.ObjectId,
  updateData: Partial<Device>,
): Promise<Device | null> {
  const now = new Date();
  return await DeviceModel.findByIdAndUpdate(
    id,
    {
      ...updateData,
      updatedAt: now,
      lastActiveAt: now,
    },
    { new: true },
  )
    .populate('user', 'name email role')
    .lean();
}

async function updatePushToken(
  id: Types.ObjectId,
  pushToken: string,
): Promise<Device | null> {
  const now = new Date();
  return await DeviceModel.findByIdAndUpdate(
    id,
    {
      pushToken,
      updatedAt: now,
      lastActiveAt: now,
    },
    { new: true },
  )
    .populate('user', 'name email role')
    .lean();
}

async function deactivate(id: Types.ObjectId): Promise<Device | null> {
  const now = new Date();
  return await DeviceModel.findByIdAndUpdate(
    id,
    {
      isActive: false,
      updatedAt: now,
    },
    { new: true },
  )
    .populate('user', 'name email role')
    .lean();
}

async function updateLastActiveAt(id: Types.ObjectId): Promise<Device | null> {
  const now = new Date();
  return await DeviceModel.findByIdAndUpdate(
    id,
    {
      lastActiveAt: now,
      updatedAt: now,
    },
    { new: true },
  ).lean();
}

async function findActiveDevicesByUsers(
  userIds: Types.ObjectId[],
): Promise<Device[]> {
  return await DeviceModel.find({
    user: { $in: userIds },
    isActive: true,
    pushToken: { $exists: true, $ne: null },
  })
    .populate('user', 'name email role')
    .lean();
}

async function deleteDevice(id: Types.ObjectId): Promise<boolean> {
  const result = await DeviceModel.deleteOne({ _id: id });
  return result.deletedCount > 0;
}

async function findOrCreateDevice(deviceData: {
  user: Types.ObjectId;
  deviceId: string;
  deviceType: 'IOS' | 'ANDROID';
  deviceName?: string;
  pushToken?: string;
  appVersion?: string;
  osVersion?: string;
  metadata?: Record<string, any>;
}): Promise<Device> {
  let device = await findByDeviceId(deviceData.deviceId);

  if (device) {
    // Update existing device
    const now = new Date();
    device = await DeviceModel.findByIdAndUpdate(
      device._id,
      {
        user: deviceData.user,
        deviceName: deviceData.deviceName,
        pushToken: deviceData.pushToken,
        appVersion: deviceData.appVersion,
        osVersion: deviceData.osVersion,
        metadata: deviceData.metadata,
        isActive: true,
        lastActiveAt: now,
        updatedAt: now,
      },
      { new: true },
    )
      .populate('user', 'name email role')
      .lean();
  } else {
    // Create new device
    device = await create(deviceData);
  }

  return device!;
}

export default {
  create,
  findById,
  findByDeviceId,
  findByUserId,
  findByPushToken,
  update,
  updatePushToken,
  deactivate,
  updateLastActiveAt,
  findActiveDevicesByUsers,
  deleteDevice,
  findOrCreateDevice,
};

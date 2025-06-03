import { Schema, model, Types } from 'mongoose';

export default interface Device {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  deviceId: string;
  deviceType: 'IOS' | 'ANDROID';
  deviceName?: string;
  pushToken?: string;
  appVersion?: string;
  osVersion?: string;
  lastActiveAt: Date;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export const DOCUMENT_NAME = 'Device';
export const COLLECTION_NAME = 'devices';

const schema = new Schema<Device>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    deviceId: {
      type: Schema.Types.String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    deviceType: {
      type: Schema.Types.String,
      required: true,
      enum: ['IOS', 'ANDROID'],
    },
    deviceName: {
      type: Schema.Types.String,
      trim: true,
    },
    pushToken: {
      type: Schema.Types.String,
      trim: true,
      index: true,
    },
    appVersion: {
      type: Schema.Types.String,
      trim: true,
    },
    osVersion: {
      type: Schema.Types.String,
      trim: true,
    },
    lastActiveAt: {
      type: Schema.Types.Date,
      required: true,
      default: Date.now,
    },
    isActive: {
      type: Schema.Types.Boolean,
      default: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    createdAt: {
      type: Schema.Types.Date,
      required: true,
      select: false,
    },
    updatedAt: {
      type: Schema.Types.Date,
      required: true,
      select: false,
    },
  },
  {
    versionKey: false,
  },
);

schema.index({ user: 1 });
schema.index({ deviceId: 1 });
schema.index({ pushToken: 1 }, { sparse: true });
schema.index({ user: 1, isActive: 1 });

export const DeviceModel = model<Device>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);

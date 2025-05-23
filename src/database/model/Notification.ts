import { Schema, model, Types } from 'mongoose';

export const DOCUMENT_NAME = 'Notification';
export const COLLECTION_NAME = 'notifications';

export default interface Notification {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  title: string;
  message: string;
  type: 'APPOINTMENT' | 'PRESCRIPTION' | 'PAYMENT' | 'SYSTEM' | 'OTHER';
  isRead: boolean;
  data?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<Notification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },
    message: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },
    type: {
      type: Schema.Types.String,
      required: true,
      enum: ['APPOINTMENT', 'PRESCRIPTION', 'PAYMENT', 'SYSTEM', 'OTHER'],
    },
    isRead: {
      type: Schema.Types.Boolean,
      default: false,
    },
    data: {
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

// Create indexes
schema.index({ user: 1, createdAt: -1 });
schema.index({ user: 1, isRead: 1 });

export const NotificationModel = model<Notification>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);

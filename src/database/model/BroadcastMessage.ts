import { Schema, model, Types, Document } from 'mongoose';

export const DOCUMENT_NAME = 'BroadcastMessage';
export const COLLECTION_NAME = 'broadcast_messages';

export default interface BroadcastMessage extends Document {
  _id: Types.ObjectId;
  title: string;
  content: string;
  sender: Types.ObjectId;
  targetAudience: 'ALL' | 'PATIENTS' | 'DOCTORS' | 'STAFF' | 'SPECIFIC';
  specificRecipients?: Types.ObjectId[];
  messageType: 'ANNOUNCEMENT' | 'ALERT' | 'UPDATE' | 'MAINTENANCE';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'DRAFT' | 'SCHEDULED' | 'SENT' | 'CANCELLED';
  scheduledAt?: Date;
  sentAt?: Date;
  expiresAt?: Date;
  attachments?: string[];
  deliveryStats: {
    sent: number;
    delivered: number;
    read: number;
  };
  readBy: {
    user: Types.ObjectId;
    readAt: Date;
  }[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<BroadcastMessage>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetAudience: {
      type: String,
      required: true,
      enum: ['ALL', 'PATIENTS', 'DOCTORS', 'STAFF', 'SPECIFIC'],
    },
    specificRecipients: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    messageType: {
      type: String,
      required: true,
      enum: ['ANNOUNCEMENT', 'ALERT', 'UPDATE', 'MAINTENANCE'],
      default: 'ANNOUNCEMENT',
    },
    priority: {
      type: String,
      required: true,
      enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
      default: 'NORMAL',
    },
    status: {
      type: String,
      required: true,
      enum: ['DRAFT', 'SCHEDULED', 'SENT', 'CANCELLED'],
      default: 'DRAFT',
    },
    scheduledAt: {
      type: Date,
    },
    sentAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    attachments: [
      {
        type: String,
      },
    ],
    deliveryStats: {
      sent: {
        type: Number,
        default: 0,
      },
      delivered: {
        type: Number,
        default: 0,
      },
      read: {
        type: Number,
        default: 0,
      },
    },
    readBy: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        readAt: {
          type: Date,
          required: true,
          default: Date.now,
        },
      },
    ],
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Indexes for efficient queries
schema.index({ sender: 1, createdAt: -1 });
schema.index({ status: 1, scheduledAt: 1 });
schema.index({ targetAudience: 1, status: 1 });
schema.index({ priority: 1, status: 1 });
schema.index({ expiresAt: 1 });

export const BroadcastMessageModel = model<BroadcastMessage>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);

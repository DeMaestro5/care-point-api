import { Schema, model, Types, Document } from 'mongoose';

export const DOCUMENT_NAME = 'Message';
export const COLLECTION_NAME = 'messages';

export default interface Message extends Document {
  _id: Types.ObjectId;
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  recipients: Types.ObjectId[];
  subject?: string;
  content: string;
  messageType: 'TEXT' | 'APPOINTMENT' | 'PRESCRIPTION' | 'REFERRAL' | 'SYSTEM';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'SENT' | 'DELIVERED' | 'READ';
  readBy: {
    user: Types.ObjectId;
    readAt: Date;
  }[];
  attachments?: string[];
  isEncrypted: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<Message>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipients: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    subject: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    messageType: {
      type: String,
      required: true,
      enum: ['TEXT', 'APPOINTMENT', 'PRESCRIPTION', 'REFERRAL', 'SYSTEM'],
      default: 'TEXT',
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
      enum: ['SENT', 'DELIVERED', 'READ'],
      default: 'SENT',
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
    attachments: [
      {
        type: String,
      },
    ],
    isEncrypted: {
      type: Boolean,
      default: true,
    },
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
schema.index({ conversation: 1, createdAt: -1 });
schema.index({ sender: 1, createdAt: -1 });
schema.index({ recipients: 1, createdAt: -1 });
schema.index({ status: 1, createdAt: -1 });
schema.index({ messageType: 1, createdAt: -1 });
schema.index({ priority: 1, status: 1 });

export const MessageModel = model<Message>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);

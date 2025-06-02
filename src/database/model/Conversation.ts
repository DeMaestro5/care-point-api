import { Schema, model, Types, Document } from 'mongoose';

export const DOCUMENT_NAME = 'Conversation';
export const COLLECTION_NAME = 'conversations';

export default interface Conversation extends Document {
  _id: Types.ObjectId;
  participants: Types.ObjectId[];
  type: 'DIRECT' | 'GROUP' | 'BROADCAST';
  title?: string;
  description?: string;
  lastMessage?: Types.ObjectId;
  lastActivity: Date;
  isArchived: boolean;
  metadata?: Record<string, any>;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<Conversation>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    type: {
      type: String,
      required: true,
      enum: ['DIRECT', 'GROUP', 'BROADCAST'],
      default: 'DIRECT',
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    lastActivity: {
      type: Date,
      required: true,
      default: Date.now,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Indexes for efficient queries
schema.index({ participants: 1, lastActivity: -1 });
schema.index({ type: 1, lastActivity: -1 });
schema.index({ createdBy: 1, createdAt: -1 });
schema.index({ isArchived: 1, lastActivity: -1 });

export const ConversationModel = model<Conversation>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);

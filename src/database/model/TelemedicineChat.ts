import { Document, Schema, Types, model } from 'mongoose';

export default interface TelemedicineChat extends Document {
  session: Types.ObjectId;
  sender: Types.ObjectId;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema(
  {
    session: {
      type: Schema.Types.ObjectId,
      ref: 'TelemedicineSession',
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for common queries
schema.index({ session: 1, createdAt: -1 });
schema.index({ sender: 1, createdAt: -1 });

export const TelemedicineChatModel = model<TelemedicineChat>(
  'TelemedicineChat',
  schema,
);

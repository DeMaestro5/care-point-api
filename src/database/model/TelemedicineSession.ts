import { Document, Schema, Types, model } from 'mongoose';

export default interface TelemedicineSession extends Document {
  patient: Types.ObjectId;
  doctor: Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  meetingLink?: string;
  notes?: string;
  diagnosis?: string;
  prescription?: Types.ObjectId;
  isRecording: boolean;
  recordingUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true,
    },
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    endTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
      default: 'scheduled',
      required: true,
    },
    meetingLink: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    diagnosis: {
      type: String,
      trim: true,
    },
    prescription: {
      type: Schema.Types.ObjectId,
      ref: 'Prescription',
    },
    isRecording: {
      type: Boolean,
      default: false,
    },
    recordingUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for common queries
schema.index({ patient: 1, startTime: -1 });
schema.index({ doctor: 1, startTime: -1 });
schema.index({ status: 1, startTime: -1 });

export const TelemedicineSessionModel = model<TelemedicineSession>(
  'TelemedicineSession',
  schema,
);

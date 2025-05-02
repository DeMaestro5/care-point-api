import { Schema, model, Types } from 'mongoose';
import MedicalHistorySchema from './MedicalHistory';

export const DOCUMENT_NAME = 'Patient';
export const COLLECTION_NAME = 'patients';

export default interface Patient {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  dateOfBirth?: Date;
  gender?: string;
  bloodGroup?: string;
  height?: number;
  weight?: number;
  allergies?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory?: Array<{
    entryId: Types.ObjectId;
    condition: string;
    diagnosis: string;
    treatment: string;
    date: Date;
    addedBy: Types.ObjectId;
    addedAt: Date;
    updatedBy?: Types.ObjectId;
    updatedAt?: Date;
  }>;
  accessLogs?: Array<{
    userId: Types.ObjectId;
    action: string;
    timestamp: Date;
  }>;
  status?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<Patient>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dateOfBirth: {
      type: Schema.Types.Date,
    },
    gender: {
      type: Schema.Types.String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
    },
    bloodGroup: {
      type: Schema.Types.String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    height: {
      type: Schema.Types.Number,
    },
    weight: {
      type: Schema.Types.Number,
    },
    allergies: [
      {
        type: Schema.Types.String,
      },
    ],
    emergencyContact: {
      name: { type: Schema.Types.String, required: true },
      phone: { type: Schema.Types.String, required: true },
      relationship: { type: Schema.Types.String, required: true },
    },
    medicalHistory: [MedicalHistorySchema],
    accessLogs: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        action: { type: Schema.Types.String, required: true },
        timestamp: { type: Schema.Types.Date, required: true },
      },
    ],
    status: {
      type: Schema.Types.Boolean,
      default: true,
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
schema.index({ status: 1 });

export const PatientModel = model<Patient>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);

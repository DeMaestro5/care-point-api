import { Schema, model, Document, Types } from 'mongoose';

export const DOCUMENT_NAME = 'VitalSigns';
export const COLLECTION_NAME = 'vital_signs';

export default interface VitalSigns extends Document {
  patient: Types.ObjectId;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  notes?: string;
  recordedBy: Types.ObjectId;
  recordedAt: Date;
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
    bloodPressure: {
      systolic: { type: Number, min: 0 },
      diastolic: { type: Number, min: 0 },
    },
    heartRate: {
      type: Number,
      min: 0,
    },
    temperature: {
      type: Number,
      min: 0,
    },
    respiratoryRate: {
      type: Number,
      min: 0,
    },
    oxygenSaturation: {
      type: Number,
      min: 0,
      max: 100,
    },
    weight: {
      type: Number,
      min: 0,
    },
    height: {
      type: Number,
      min: 0,
    },
    bmi: {
      type: Number,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recordedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Index for patient's vital signs by date
schema.index({ patient: 1, recordedAt: -1 });

export const VitalSignsModel = model<VitalSigns>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);

import { Schema, model, Document, Types } from 'mongoose';

export const DOCUMENT_NAME = 'MedicalRecord';
export const COLLECTION_NAME = 'medical_records';

export default interface MedicalRecord extends Document {
  patient: Types.ObjectId;
  diagnosis: string;
  treatment: string;
  notes?: string;
  attachments?: string[];
  recordDate: Date;
  createdBy: Types.ObjectId; // Just store the ID of the doctor who created it
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
    diagnosis: {
      type: String,
      required: true,
      trim: true,
    },
    treatment: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    attachments: [
      {
        type: String,
        trim: true,
      },
    ],
    recordDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to the user (doctor) who created the record
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for patient's records by date
schema.index({ patient: 1, recordDate: -1 });

export const MedicalRecordModel = model<MedicalRecord>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);

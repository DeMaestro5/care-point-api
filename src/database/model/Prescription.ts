import { Schema, model, Types } from 'mongoose';

export const DOCUMENT_NAME = 'Prescription';
export const COLLECTION_NAME = 'prescriptions';

export default interface Prescription {
  _id?: Types.ObjectId;
  patient: Types.ObjectId;
  doctor: Types.ObjectId;
  pharmacy?: Types.ObjectId;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
  diagnosis?: string;
  notes?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<Prescription>(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    pharmacy: {
      type: Schema.Types.ObjectId,
      ref: 'Pharmacy',
    },
    medications: [
      {
        name: { type: Schema.Types.String, required: true },
        dosage: { type: Schema.Types.String, required: true },
        frequency: { type: Schema.Types.String, required: true },
        duration: { type: Schema.Types.String, required: true },
        instructions: { type: Schema.Types.String },
      },
    ],
    diagnosis: {
      type: Schema.Types.String,
    },
    notes: {
      type: Schema.Types.String,
    },
    status: {
      type: Schema.Types.String,
      enum: ['ACTIVE', 'COMPLETED', 'CANCELLED'],
      default: 'ACTIVE',
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

schema.index({ patient: 1 });
schema.index({ doctor: 1 });
schema.index({ pharmacy: 1 });
schema.index({ status: 1 });

export const PrescriptionModel = model<Prescription>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);

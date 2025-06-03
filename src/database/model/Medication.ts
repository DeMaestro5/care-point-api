import { Schema, model, Types } from 'mongoose';

export const DOCUMENT_NAME = 'Medication';
export const COLLECTION_NAME = 'medications';

export default interface Medication {
  _id: Types.ObjectId;
  name: string;
  genericName: string;
  description?: string;
  category: string;
  manufacturer: string;
  unit: string;
  dosageForm: string;
  strength: string;
  prescriptionRequired: boolean;
  sideEffects?: string[];
  contraindications?: string[];
  storageInstructions?: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<Medication>(
  {
    name: {
      type: Schema.Types.String,
      required: true,
      trim: true,
      index: true,
    },
    genericName: {
      type: Schema.Types.String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: Schema.Types.String,
      trim: true,
    },
    category: {
      type: Schema.Types.String,
      required: true,
      trim: true,
      index: true,
    },
    manufacturer: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },
    unit: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },
    dosageForm: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },
    strength: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },
    prescriptionRequired: {
      type: Schema.Types.Boolean,
      default: false,
    },
    sideEffects: [
      {
        type: Schema.Types.String,
        trim: true,
      },
    ],
    contraindications: [
      {
        type: Schema.Types.String,
        trim: true,
      },
    ],
    storageInstructions: {
      type: Schema.Types.String,
      trim: true,
    },
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

// Create text index for search functionality
schema.index({ name: 'text', genericName: 'text', category: 'text' });

export const MedicationModel = model<Medication>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);

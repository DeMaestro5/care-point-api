import mongoose, { Document, Schema } from 'mongoose';

export interface IInsurance extends Document {
  patientId: mongoose.Types.ObjectId;
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  coverageType: 'PRIMARY' | 'SECONDARY' | 'TERTIARY';
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const insuranceSchema = new Schema<IInsurance>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    provider: {
      type: String,
      required: true,
      trim: true,
    },
    policyNumber: {
      type: String,
      required: true,
      trim: true,
    },
    groupNumber: {
      type: String,
      trim: true,
    },
    coverageType: {
      type: String,
      enum: ['PRIMARY', 'SECONDARY', 'TERTIARY'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Create compound index on patientId and isActive
insuranceSchema.index({ patientId: 1, isActive: 1 });

export const Insurance = mongoose.model<IInsurance>(
  'Insurance',
  insuranceSchema,
);

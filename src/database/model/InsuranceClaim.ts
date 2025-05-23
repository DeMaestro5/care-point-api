import mongoose, { Document, Schema } from 'mongoose';

export interface IInsuranceClaim extends Document {
  patientId: mongoose.Types.ObjectId;
  insuranceId: mongoose.Types.ObjectId;
  serviceType: string;
  amount: number;
  description: string;
  documents?: string[];
  dateOfService: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSING';
  notes?: string;
  processedBy?: mongoose.Types.ObjectId;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const insuranceClaimSchema = new Schema<IInsuranceClaim>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    insuranceId: {
      type: Schema.Types.ObjectId,
      ref: 'Insurance',
      required: true,
    },
    serviceType: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    documents: [
      {
        type: String,
        trim: true,
      },
    ],
    dateOfService: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'PROCESSING'],
      default: 'PENDING',
    },
    notes: {
      type: String,
      trim: true,
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Create compound indexes
insuranceClaimSchema.index({ patientId: 1, status: 1 });
insuranceClaimSchema.index({ insuranceId: 1, status: 1 });

export const InsuranceClaim = mongoose.model<IInsuranceClaim>(
  'InsuranceClaim',
  insuranceClaimSchema,
);

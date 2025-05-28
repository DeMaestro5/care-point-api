import { Schema, model, Document } from 'mongoose';

export interface ILabOrder extends Document {
  patientId: string;
  doctorId: string;
  testName: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILabResult extends Document {
  labOrderId: string;
  technicianId: string;
  results: Array<{
    testName: string;
    value: string;
    unit?: string;
    referenceRange?: string;
    interpretation?: string;
  }>;
  notes?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

const LabOrderSchema = new Schema<ILabOrder>(
  {
    patientId: { type: String, required: true },
    doctorId: { type: String, required: true },
    testName: { type: String, required: true },
    description: { type: String },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
    },
    notes: { type: String },
  },
  { timestamps: true },
);

const LabResultSchema = new Schema<ILabResult>(
  {
    labOrderId: { type: String, required: true },
    technicianId: { type: String, required: true },
    results: [
      {
        testName: { type: String, required: true },
        value: { type: String, required: true },
        unit: { type: String },
        referenceRange: { type: String },
        interpretation: { type: String },
      },
    ],
    notes: { type: String },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      required: true,
    },
  },
  { timestamps: true },
);

export const LabOrder = model<ILabOrder>('LabOrder', LabOrderSchema);
export const LabResult = model<ILabResult>('LabResult', LabResultSchema);

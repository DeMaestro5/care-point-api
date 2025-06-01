import { Schema, model, Document } from 'mongoose';

export interface Goal {
  description: string;
  targetDate: Date;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface Activity {
  description: string;
  frequency: string;
  duration: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface CarePlan extends Document {
  patientId: Schema.Types.ObjectId;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  goals: Goal[];
  activities: Activity[];
  assignedTo: Schema.Types.ObjectId[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CarePlanSchema = new Schema<CarePlan>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    goals: [
      {
        description: { type: String, required: true },
        targetDate: { type: Date, required: true },
        status: {
          type: String,
          enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
          default: 'NOT_STARTED',
        },
      },
    ],
    activities: [
      {
        description: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true },
        status: {
          type: String,
          enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
          default: 'NOT_STARTED',
        },
      },
    ],
    assignedTo: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    notes: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

export const CarePlanModel = model<CarePlan>('CarePlan', CarePlanSchema);

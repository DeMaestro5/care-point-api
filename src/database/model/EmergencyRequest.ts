import { Schema, model, Document, Types } from 'mongoose';

export interface IEmergencyRequest extends Document {
  patient: Types.ObjectId;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

const EmergencyRequestSchema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: { type: String, required: true },
    },
    description: { type: String, required: true },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
    },
  },
  { timestamps: true },
);

export const EmergencyRequestModel = model<IEmergencyRequest>(
  'EmergencyRequest',
  EmergencyRequestSchema,
);

export default IEmergencyRequest;

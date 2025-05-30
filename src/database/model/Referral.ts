import { Schema, model, Document } from 'mongoose';

export enum ReferralStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface IReferral extends Document {
  patientId: Schema.Types.ObjectId;
  referredBy: Schema.Types.ObjectId;
  referredTo: Schema.Types.ObjectId;
  reason: string;
  notes?: string;
  status: ReferralStatus;
  appointmentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const referralSchema = new Schema<IReferral>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    referredTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(ReferralStatus),
      default: ReferralStatus.PENDING,
    },
    appointmentDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export default model<IReferral>('Referral', referralSchema);

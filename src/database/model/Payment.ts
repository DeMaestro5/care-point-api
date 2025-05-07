import { Schema, model, Types } from 'mongoose';

export const DOCUMENT_NAME = 'Payment';
export const COLLECTION_NAME = 'payments';

export default interface Payment {
  _id: Types.ObjectId;
  patientId: Types.ObjectId;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  description?: string;
  reference?: string;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<Payment>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    amount: {
      type: Schema.Types.Number,
      required: true,
    },
    currency: {
      type: Schema.Types.String,
      required: true,
      default: 'NGN',
    },
    paymentMethod: {
      type: Schema.Types.String,
      required: true,
      enum: ['CASH', 'CARD', 'BANK_TRANSFER', 'MOBILE_MONEY'],
    },
    status: {
      type: Schema.Types.String,
      required: true,
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },
    description: {
      type: Schema.Types.String,
    },
    reference: {
      type: Schema.Types.String,
    },
    metadata: {
      type: Schema.Types.Mixed,
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

schema.index({ patientId: 1 });
schema.index({ status: 1 });
schema.index({ createdAt: -1 });

export const PaymentModel = model<Payment>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);

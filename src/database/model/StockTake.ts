import { Schema, model, Types } from 'mongoose';

export const DOCUMENT_NAME = 'StockTake';
export const COLLECTION_NAME = 'stock_takes';

export interface StockTakeItem {
  medication: Types.ObjectId;
  expectedQuantity: number;
  actualQuantity: number;
  variance: number;
  unit: string;
  batchNumber?: string;
  expiryDate?: Date;
  notes?: string;
}

export interface StockTake {
  _id: Types.ObjectId;
  pharmacy: Types.ObjectId;
  stockTakeDate: Date;
  type: 'FULL' | 'PARTIAL' | 'SPOT_CHECK' | 'AUDIT';
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  conductedBy: Types.ObjectId;
  reviewedBy?: Types.ObjectId;
  items: StockTakeItem[];
  totalVariance: number;
  varianceValue: number; // Monetary value of variances
  notes?: string;
  reason: string;
  startedAt: Date;
  completedAt?: Date;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const stockTakeItemSchema = new Schema<StockTakeItem>(
  {
    medication: {
      type: Schema.Types.ObjectId,
      ref: 'Medication',
      required: true,
    },
    expectedQuantity: {
      type: Schema.Types.Number,
      required: true,
      min: 0,
    },
    actualQuantity: {
      type: Schema.Types.Number,
      required: true,
      min: 0,
    },
    variance: {
      type: Schema.Types.Number,
      required: true,
    },
    unit: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },
    batchNumber: {
      type: Schema.Types.String,
      trim: true,
    },
    expiryDate: {
      type: Schema.Types.Date,
    },
    notes: {
      type: Schema.Types.String,
      trim: true,
    },
  },
  { _id: false },
);

const schema = new Schema<StockTake>(
  {
    pharmacy: {
      type: Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: true,
    },
    stockTakeDate: {
      type: Schema.Types.Date,
      required: true,
    },
    type: {
      type: Schema.Types.String,
      enum: ['FULL', 'PARTIAL', 'SPOT_CHECK', 'AUDIT'],
      required: true,
    },
    status: {
      type: Schema.Types.String,
      enum: ['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'DRAFT',
    },
    conductedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    items: [stockTakeItemSchema],
    totalVariance: {
      type: Schema.Types.Number,
      default: 0,
    },
    varianceValue: {
      type: Schema.Types.Number,
      default: 0,
    },
    notes: {
      type: Schema.Types.String,
      trim: true,
    },
    reason: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },
    startedAt: {
      type: Schema.Types.Date,
      default: Date.now,
    },
    completedAt: {
      type: Schema.Types.Date,
    },
    reviewedAt: {
      type: Schema.Types.Date,
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

schema.index({ pharmacy: 1 });
schema.index({ status: 1 });
schema.index({ type: 1 });
schema.index({ stockTakeDate: -1 });
schema.index({ conductedBy: 1 });

export const StockTakeModel = model<StockTake>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);

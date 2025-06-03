import { Schema, model, Types } from 'mongoose';

export const DOCUMENT_NAME = 'InventoryTransfer';
export const COLLECTION_NAME = 'inventory_transfers';

export interface InventoryTransfer {
  _id: Types.ObjectId;
  fromLocation: Types.ObjectId; // Source pharmacy/location
  toLocation: Types.ObjectId; // Destination pharmacy/location
  medication: Types.ObjectId;
  quantity: number;
  unit: string;
  batchNumber?: string;
  expiryDate?: Date;
  transferType: 'INTER_PHARMACY' | 'STOCK_ADJUSTMENT' | 'DONATION' | 'RETURN';
  status: 'PENDING' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  requestedBy: Types.ObjectId; // User who requested the transfer
  approvedBy?: Types.ObjectId; // User who approved the transfer
  completedBy?: Types.ObjectId; // User who completed the transfer
  reason: string;
  notes?: string;
  requestedAt: Date;
  approvedAt?: Date;
  completedAt?: Date;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  actualCost?: number;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<InventoryTransfer>(
  {
    fromLocation: {
      type: Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: true,
    },
    toLocation: {
      type: Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: true,
    },
    medication: {
      type: Schema.Types.ObjectId,
      ref: 'Medication',
      required: true,
    },
    quantity: {
      type: Schema.Types.Number,
      required: true,
      min: 0,
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
    transferType: {
      type: Schema.Types.String,
      enum: ['INTER_PHARMACY', 'STOCK_ADJUSTMENT', 'DONATION', 'RETURN'],
      required: true,
    },
    status: {
      type: Schema.Types.String,
      enum: ['PENDING', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    completedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reason: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },
    notes: {
      type: Schema.Types.String,
      trim: true,
    },
    requestedAt: {
      type: Schema.Types.Date,
      default: Date.now,
    },
    approvedAt: {
      type: Schema.Types.Date,
    },
    completedAt: {
      type: Schema.Types.Date,
    },
    trackingNumber: {
      type: Schema.Types.String,
      trim: true,
    },
    estimatedDelivery: {
      type: Schema.Types.Date,
    },
    actualCost: {
      type: Schema.Types.Number,
      min: 0,
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

schema.index({ fromLocation: 1 });
schema.index({ toLocation: 1 });
schema.index({ medication: 1 });
schema.index({ status: 1 });
schema.index({ transferType: 1 });
schema.index({ requestedAt: -1 });

export const InventoryTransferModel = model<InventoryTransfer>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);

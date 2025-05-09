import { Schema, model, Types } from 'mongoose';

export const DOCUMENT_NAME = 'Inventory';
export const COLLECTION_NAME = 'inventories';

export interface Inventory {
  _id: Types.ObjectId;
  pharmacy: Types.ObjectId;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  expiryDate?: Date;
  batchNumber?: string;
  manufacturer?: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<Inventory>(
  {
    pharmacy: {
      type: Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: true,
    },
    name: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },
    description: {
      type: Schema.Types.String,
      trim: true,
    },
    category: {
      type: Schema.Types.String,
      required: true,
      trim: true,
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
    price: {
      type: Schema.Types.Number,
      required: true,
      min: 0,
    },
    expiryDate: {
      type: Schema.Types.Date,
    },
    batchNumber: {
      type: Schema.Types.String,
      trim: true,
    },
    manufacturer: {
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

schema.index({ pharmacy: 1 });
schema.index({ status: 1 });
schema.index({ name: 1 });
schema.index({ category: 1 });

export const InventoryModel = model<Inventory>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);

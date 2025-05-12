import { Schema, model, Document, Types } from 'mongoose';

export interface OrderItem {
  inventory: Types.ObjectId;
  quantity: number;
  price: number;
}

export interface Order extends Document {
  pharmacy: Types.ObjectId;
  items: OrderItem[];
  totalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DOCUMENT_NAME = 'Order';
const COLLECTION_NAME = 'orders';

const schema = new Schema(
  {
    pharmacy: {
      type: Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: true,
    },
    items: [
      {
        inventory: {
          type: Schema.Types.ObjectId,
          ref: 'Inventory',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const OrderModel = model<Order>(DOCUMENT_NAME, schema, COLLECTION_NAME);

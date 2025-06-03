import { Schema, model, Document } from 'mongoose';

export const DOCUMENT_NAME = 'Holiday';
export const COLLECTION_NAME = 'holidays';

export enum HolidayType {
  NATIONAL = 'NATIONAL',
  RELIGIOUS = 'RELIGIOUS',
  LOCAL = 'LOCAL',
  CUSTOM = 'CUSTOM',
}

export enum OperationalStatus {
  CLOSED = 'CLOSED',
  LIMITED = 'LIMITED',
  EMERGENCY_ONLY = 'EMERGENCY_ONLY',
}

export default interface Holiday extends Document {
  _id: Schema.Types.ObjectId;
  name: string;
  date: Date;
  type: HolidayType;
  operationalStatus: OperationalStatus;
  description?: string;
  isRecurring: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<Holiday>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(HolidayType),
      required: true,
    },
    operationalStatus: {
      type: String,
      enum: Object.values(OperationalStatus),
      required: true,
      default: OperationalStatus.CLOSED,
    },
    description: {
      type: String,
      trim: true,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

// Index for finding holidays by date range
schema.index({ date: 1, isActive: 1 });

export const HolidayModel = model<Holiday>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);

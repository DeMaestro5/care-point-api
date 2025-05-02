import { Schema, model, Types } from 'mongoose';

export const DOCUMENT_NAME = 'Pharmacy';
export const COLLECTION_NAME = 'pharmacies';

export default interface Pharmacy {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  licenseNumber?: string;
  address?: string;
  phoneNumber?: string;
  workingHours?: string;
  services?: string[];
  status?: boolean;
  hasInsuranceSupport?: boolean;
  acceptedInsuranceProviders?: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<Pharmacy>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    licenseNumber: {
      type: Schema.Types.String,
      unique: true,
    },
    address: {
      type: Schema.Types.String,
    },
    phoneNumber: {
      type: Schema.Types.String,
    },
    workingHours: {
      type: Schema.Types.String,
    },
    services: {
      type: [Schema.Types.String],
    },
    hasInsuranceSupport: {
      type: Schema.Types.Boolean,
      default: false,
    },
    acceptedInsuranceProviders: {
      type: [Schema.Types.String],
    },
    coordinates: {
      latitude: {
        type: Schema.Types.Number,
      },
      longitude: {
        type: Schema.Types.Number,
      },
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

schema.index({ user: 1 });
schema.index({ status: 1 });

export const PharmacyModel = model<Pharmacy>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);

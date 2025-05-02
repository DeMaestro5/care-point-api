import { Schema, model, Types } from 'mongoose';

export const DOCUMENT_NAME = 'Ambulance';
export const COLLECTION_NAME = 'ambulances';

export default interface Ambulance {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  vehicleNumbers?: string[];
  vehicleTypes?: string[];
  vehicleCount?: number;
  equipments?: string[];
  crewMembers?: {
    name: string;
    role: string;
    experience: string;
  }[];
  serviceArea?: string[];
  contactNumber?: string;
  operatingHours?: string[];
  baseLocation?: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  status?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<Ambulance>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vehicleNumbers: [
      {
        type: Schema.Types.String,
        unique: true,
      },
    ],
    vehicleTypes: {
      type: [Schema.Types.String],
    },
    vehicleCount: {
      type: Schema.Types.Number,
    },
    equipments: [
      {
        type: Schema.Types.String,
      },
    ],
    crewMembers: [
      {
        name: {
          type: Schema.Types.String,
          required: true,
        },
        role: {
          type: Schema.Types.String,
          required: true,
        },
        experience: {
          type: Schema.Types.String,
          required: true,
        },
      },
    ],
    serviceArea: {
      type: [Schema.Types.String],
    },
    contactNumber: {
      type: Schema.Types.String,
    },
    operatingHours: {
      type: [Schema.Types.String],
    },
    baseLocation: {
      address: {
        type: Schema.Types.String,
      },
      coordinates: {
        latitude: {
          type: Schema.Types.Number,
        },
        longitude: {
          type: Schema.Types.Number,
        },
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

export const AmbulanceModel = model<Ambulance>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);

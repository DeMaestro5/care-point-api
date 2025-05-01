import { Schema, model, Types } from 'mongoose';

export const DOCUMENT_NAME = 'Ambulance';
export const COLLECTION_NAME = 'ambulances';

export default interface Ambulance {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  vehicleNumber?: string;
  vehicleType?: string;
  equipment?: string[];
  crewMembers?: number;
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
    vehicleNumber: {
      type: Schema.Types.String,
      unique: true,
    },
    vehicleType: {
      type: Schema.Types.String,
    },
    equipment: [
      {
        type: Schema.Types.String,
      },
    ],
    crewMembers: {
      type: Schema.Types.Number,
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

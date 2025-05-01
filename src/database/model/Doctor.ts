import { Schema, model, Types } from 'mongoose';

export const DOCUMENT_NAME = 'Doctor';
export const COLLECTION_NAME = 'doctors';

export default interface Doctor {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  specialization?: string;
  licenseNumber?: string;
  yearsOfExperience?: number;
  education?: string[];
  certifications?: string[];
  status?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<Doctor>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    specialization: {
      type: Schema.Types.String,
    },
    licenseNumber: {
      type: Schema.Types.String,
      unique: true,
    },
    yearsOfExperience: {
      type: Schema.Types.Number,
    },
    education: [
      {
        type: Schema.Types.String,
      },
    ],
    certifications: [
      {
        type: Schema.Types.String,
      },
    ],
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

export const DoctorModel = model<Doctor>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);

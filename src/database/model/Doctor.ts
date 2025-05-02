import { Schema, model, Types } from 'mongoose';

export const DOCUMENT_NAME = 'Doctor';
export const COLLECTION_NAME = 'doctors';

export default interface Doctor {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  specialization?: string;
  licenseNumber?: string;
  consultationFee?: number;
  yearsOfExperience?: number;
  availability?: {
    monday?: string[];
    tuesday?: string[];
    wednesday?: string[];
    thursday?: string[];
    friday?: string[];
    saturday?: string[];
    sunday?: string[];
  };
  education?: string[];
  qualification?: string;
  certifications?: string[];
  status?: boolean;
  hospital?: string;
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
    hospital: {
      type: Schema.Types.String,
    },
    availability: {
      monday: [
        {
          type: Schema.Types.String,
        },
      ],
      tuesday: [
        {
          type: Schema.Types.String,
        },
      ],
      wednesday: [
        {
          type: Schema.Types.String,
        },
      ],
      thursday: [
        {
          type: Schema.Types.String,
        },
      ],
      friday: [
        {
          type: Schema.Types.String,
        },
      ],
      saturday: [
        {
          type: Schema.Types.String,
        },
      ],
      sunday: [
        {
          type: Schema.Types.String,
        },
      ],
    },
    education: [
      {
        type: Schema.Types.String,
      },
    ],

    qualification: {
      type: Schema.Types.String,
    },
    consultationFee: {
      type: Schema.Types.Number,
    },
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

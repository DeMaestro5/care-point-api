import { Schema, model, Types } from 'mongoose';

export const DOCUMENT_NAME = 'FamilyMember';
export const COLLECTION_NAME = 'family_members';

export default interface FamilyMember {
  _id: Types.ObjectId;
  patientId: Types.ObjectId;
  name: string;
  relationship: string;
  dateOfBirth?: Date;
  gender?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  isEmergencyContact?: boolean;
  status?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<FamilyMember>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    name: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },
    relationship: {
      type: Schema.Types.String,
      required: true,
      enum: ['SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'OTHER'],
    },
    dateOfBirth: {
      type: Schema.Types.Date,
    },
    gender: {
      type: Schema.Types.String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
    },
    phoneNumber: {
      type: Schema.Types.String,
      trim: true,
    },
    email: {
      type: Schema.Types.String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: Schema.Types.String,
      trim: true,
    },
    isEmergencyContact: {
      type: Schema.Types.Boolean,
      default: false,
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

schema.index({ patientId: 1 });
schema.index({ patientId: 1, relationship: 1 });

export const FamilyMemberModel = model<FamilyMember>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);

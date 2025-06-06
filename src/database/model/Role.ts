import { Schema, model, Types } from 'mongoose';

export const DOCUMENT_NAME = 'Role';
export const COLLECTION_NAME = 'roles';

export enum RoleCode {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
  STAFF = 'STAFF',
  AMBULANCE = 'AMBULANCE',
  PHARMACY = 'PHARMACY',
}

export default interface Role {
  _id: Types.ObjectId;
  code: RoleCode;
  status?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<Role>(
  {
    code: {
      type: String,
      required: true,
      enum: Object.values(RoleCode),
      unique: true,
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

schema.index({ code: 1, status: 1 });

export const RoleModel = model<Role>(DOCUMENT_NAME, schema, COLLECTION_NAME);

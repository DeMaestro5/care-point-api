import { Schema, model, Types } from 'mongoose';

export const DOCUMENT_NAME = 'StaffRole';
export const COLLECTION_NAME = 'staffRoles';

export default interface StaffRole {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  permissions: string[];
  status?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<StaffRole>(
  {
    name: {
      type: Schema.Types.String,
      required: true,
      unique: true,
    },
    description: {
      type: Schema.Types.String,
    },
    permissions: [
      {
        type: Schema.Types.String,
        required: true,
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

schema.index({ name: 1 });
schema.index({ status: 1 });

export const StaffRoleModel = model<StaffRole>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);

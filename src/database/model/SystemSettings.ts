import { Schema, model, Document } from 'mongoose';

export const DOCUMENT_NAME = 'SystemSettings';
export const COLLECTION_NAME = 'system_settings';

export default interface SystemSettings extends Document {
  _id: Schema.Types.ObjectId;
  category: string;
  settings: Map<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<SystemSettings>(
  {
    category: {
      type: Schema.Types.String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    settings: {
      type: Map,
      of: Schema.Types.Mixed,
      default: new Map(),
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

export const SystemSettingsModel = model<SystemSettings>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);

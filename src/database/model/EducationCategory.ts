import { Schema, model, Types } from 'mongoose';

export const DOCUMENT_NAME = 'EducationCategory';
export const COLLECTION_NAME = 'education_categories';

export default interface EducationCategory {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  parentCategory?: Types.ObjectId;
  displayOrder?: number;
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<EducationCategory>(
  {
    name: {
      type: Schema.Types.String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: Schema.Types.String,
      trim: true,
      maxlength: 500,
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: DOCUMENT_NAME,
    },
    displayOrder: {
      type: Schema.Types.Number,
      default: 0,
    },
    isActive: {
      type: Schema.Types.Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdAt: {
      type: Schema.Types.Date,
      default: Date.now,
    },
    updatedAt: {
      type: Schema.Types.Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  },
);

schema.index({ name: 1 });
schema.index({ parentCategory: 1 });
schema.index({ isActive: 1 });
schema.index({ displayOrder: 1 });

export const EducationCategoryModel = model<EducationCategory>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);

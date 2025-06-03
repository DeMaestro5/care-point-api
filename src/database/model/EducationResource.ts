import { Schema, model, Types } from 'mongoose';

export const DOCUMENT_NAME = 'EducationResource';
export const COLLECTION_NAME = 'education_resources';

export enum ResourceType {
  ARTICLE = 'ARTICLE',
  VIDEO = 'VIDEO',
  PDF = 'PDF',
  INFOGRAPHIC = 'INFOGRAPHIC',
  AUDIO = 'AUDIO',
  INTERACTIVE = 'INTERACTIVE',
}

export enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export default interface EducationResource {
  _id: Types.ObjectId;
  title: string;
  description: string;
  content?: string;
  type: ResourceType;
  category: Types.ObjectId;
  tags: string[];
  difficultyLevel: DifficultyLevel;
  estimatedReadTime?: number; // in minutes
  author: string;
  medicalConditions?: string[]; // conditions this resource is relevant for
  targetAudience: string; // patients, families, caregivers, etc.
  language: string;
  fileUrl?: string; // for PDFs, videos, etc.
  thumbnailUrl?: string;
  externalUrl?: string;
  isPublished: boolean;
  publishedAt?: Date;
  viewCount: number;
  rating: {
    average: number;
    count: number;
  };
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<EducationResource>(
  {
    title: {
      type: Schema.Types.String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: Schema.Types.String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    content: {
      type: Schema.Types.String,
      trim: true,
    },
    type: {
      type: Schema.Types.String,
      enum: Object.values(ResourceType),
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'EducationCategory',
      required: true,
    },
    tags: [
      {
        type: Schema.Types.String,
        trim: true,
      },
    ],
    difficultyLevel: {
      type: Schema.Types.String,
      enum: Object.values(DifficultyLevel),
      required: true,
    },
    estimatedReadTime: {
      type: Schema.Types.Number,
      min: 1,
    },
    author: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },
    medicalConditions: [
      {
        type: Schema.Types.String,
        trim: true,
      },
    ],
    targetAudience: {
      type: Schema.Types.String,
      required: true,
      default: 'patients',
    },
    language: {
      type: Schema.Types.String,
      required: true,
      default: 'en',
    },
    fileUrl: {
      type: Schema.Types.String,
    },
    thumbnailUrl: {
      type: Schema.Types.String,
    },
    externalUrl: {
      type: Schema.Types.String,
    },
    isPublished: {
      type: Schema.Types.Boolean,
      default: false,
    },
    publishedAt: {
      type: Schema.Types.Date,
    },
    viewCount: {
      type: Schema.Types.Number,
      default: 0,
    },
    rating: {
      average: {
        type: Schema.Types.Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Schema.Types.Number,
        default: 0,
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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

schema.index({ title: 'text', description: 'text', tags: 'text' });
schema.index({ category: 1 });
schema.index({ type: 1 });
schema.index({ difficultyLevel: 1 });
schema.index({ medicalConditions: 1 });
schema.index({ isPublished: 1 });
schema.index({ publishedAt: -1 });
schema.index({ 'rating.average': -1 });
schema.index({ viewCount: -1 });

export const EducationResourceModel = model<EducationResource>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);

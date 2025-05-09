import { Schema, model, Document, Types } from 'mongoose';

export const DOCUMENT_NAME = 'Review';
export const COLLECTION_NAME = 'reviews';

export default interface Review extends Document {
  patient: Types.ObjectId;
  doctor: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export const ReviewModel = model<Review>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);

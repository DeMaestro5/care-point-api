import { Schema, model, Document as MongooseDocument, Types } from 'mongoose';

export interface FileMeta extends MongooseDocument {
  filename: string;
  mimetype: string;
  size: number;
  documentId?: Types.ObjectId;
  uploadedBy: Types.ObjectId;
  createdAt: Date;
}

const FileSchema = new Schema<FileMeta>(
  {
    filename: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    documentId: { type: Schema.Types.ObjectId, ref: 'Document' },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const FileModel = model<FileMeta>('File', FileSchema);

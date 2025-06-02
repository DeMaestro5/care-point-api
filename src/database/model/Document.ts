import { Schema, model, Document as MongooseDocument, Types } from 'mongoose';

export interface Document extends MongooseDocument {
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  category: string;
  tags: string[];
  visibility: 'PRIVATE' | 'PUBLIC' | 'RESTRICTED';
  isTemplate: boolean;
  templateData?: Record<string, any>;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<Document>(
  {
    title: { type: String, required: true },
    description: { type: String },
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
    visibility: {
      type: String,
      enum: ['PRIVATE', 'PUBLIC', 'RESTRICTED'],
      default: 'PRIVATE',
    },
    isTemplate: { type: Boolean, default: false },
    templateData: { type: Schema.Types.Mixed },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

export const DocumentModel = model<Document>('Document', DocumentSchema);

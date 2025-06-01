import { Schema, model, Document } from 'mongoose';

export interface AuditLog {
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userRole: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLogModel extends AuditLog, Document {}

const schema = new Schema(
  {
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    userId: { type: String, required: true },
    userRole: { type: String, required: true },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

export default model<AuditLogModel>('AuditLog', schema);

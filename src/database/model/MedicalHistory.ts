import { Schema, Types } from 'mongoose';

const MedicalHistorySchema = new Schema({
  entryId: {
    type: Schema.Types.ObjectId,
    required: true,
    default: () => new Types.ObjectId(),
  },
  condition: { type: String, required: true },
  diagnosis: { type: String, required: true },
  diagnosisDate: { type: Date, required: true },
  treatment: { type: String, required: true },
  date: { type: Date, required: true },
  notes: { type: String },
  addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  addedAt: { type: Date, required: true, default: Date.now },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date },
});

export default MedicalHistorySchema;

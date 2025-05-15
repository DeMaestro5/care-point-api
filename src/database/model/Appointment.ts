import { Schema, model, Document, Types, Model } from 'mongoose';

export const DOCUMENT_NAME = 'Appointment';
export const COLLECTION_NAME = 'appointments';

export default interface Appointment extends Document {
  doctor: Schema.Types.ObjectId;
  patient: Schema.Types.ObjectId;
  appointmentDate: Date;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  reason: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema(
  {
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true,
    },
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
      select: false,
    },
    appointmentDate: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled',
      index: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for common queries
schema.index({ patient: 1, appointmentDate: -1 });
schema.index({ doctor: 1, appointmentDate: -1 });
schema.index({ status: 1, appointmentDate: 1 });

// Static method to fix appointments with missing references
schema.statics.fixReferences = async function (
  appointmentId: Types.ObjectId,
  doctorId: Types.ObjectId,
  patientId: Types.ObjectId,
) {
  return this.findByIdAndUpdate(
    appointmentId,
    {
      $set: {
        doctor: doctorId,
        patient: patientId,
        updatedAt: new Date(),
      },
    },
    { new: true, runValidators: true },
  ).exec();
};

// Extend the AppointmentModel interface to include the static method
export interface AppointmentModelInterface extends Model<Appointment> {
  fixReferences(
    appointmentId: Types.ObjectId,
    doctorId: Types.ObjectId,
    patientId: Types.ObjectId,
  ): Promise<Appointment | null>;
}

export const AppointmentModel = model<Appointment>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);

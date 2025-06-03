import { Schema, model, Document } from 'mongoose';

export const DOCUMENT_NAME = 'OperationalHours';
export const COLLECTION_NAME = 'operational_hours';

export interface TimeSlot {
  start: string; // Format: "HH:MM"
  end: string; // Format: "HH:MM"
}

export interface DaySchedule {
  isOpen: boolean;
  slots: TimeSlot[];
}

export default interface OperationalHours extends Document {
  _id: Schema.Types.ObjectId;
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
  timezone: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const timeSlotSchema = new Schema<TimeSlot>(
  {
    start: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    end: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
  },
  { _id: false },
);

const dayScheduleSchema = new Schema<DaySchedule>(
  {
    isOpen: {
      type: Boolean,
      required: true,
      default: false,
    },
    slots: [timeSlotSchema],
  },
  { _id: false },
);

const schema = new Schema<OperationalHours>(
  {
    monday: { type: dayScheduleSchema, required: true },
    tuesday: { type: dayScheduleSchema, required: true },
    wednesday: { type: dayScheduleSchema, required: true },
    thursday: { type: dayScheduleSchema, required: true },
    friday: { type: dayScheduleSchema, required: true },
    saturday: { type: dayScheduleSchema, required: true },
    sunday: { type: dayScheduleSchema, required: true },
    timezone: {
      type: String,
      required: true,
      default: 'UTC',
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

export const OperationalHoursModel = model<OperationalHours>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);

import { Schema, model, Document } from 'mongoose';

export const DOCUMENT_NAME = 'CalendarEvent';
export const COLLECTION_NAME = 'calendar_events';

export default interface CalendarEvent extends Document {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  location?: string;
  organizer: Schema.Types.ObjectId; // User who created the event
  attendees: Schema.Types.ObjectId[]; // Array of User IDs
  eventType: 'APPOINTMENT' | 'MEETING' | 'REMINDER' | 'BREAK' | 'OTHER';
  status: 'scheduled' | 'completed' | 'cancelled';
  recurrence?: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    interval: number; // every X days/weeks/months/years
    endDate?: Date;
    count?: number; // number of occurrences
  };
  reminders: {
    type: 'EMAIL' | 'PUSH' | 'SMS';
    minutesBefore: number;
  }[];
  metadata?: {
    appointmentId?: Schema.Types.ObjectId;
    patientId?: Schema.Types.ObjectId;
    doctorId?: Schema.Types.ObjectId;
  };
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
      required: true,
      index: true,
    },
    allDay: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    attendees: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    eventType: {
      type: String,
      required: true,
      enum: ['APPOINTMENT', 'MEETING', 'REMINDER', 'BREAK', 'OTHER'],
      default: 'OTHER',
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
    recurrence: {
      frequency: {
        type: String,
        enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'],
      },
      interval: {
        type: Number,
        min: 1,
        default: 1,
      },
      endDate: Date,
      count: {
        type: Number,
        min: 1,
      },
    },
    reminders: [
      {
        type: {
          type: String,
          enum: ['EMAIL', 'PUSH', 'SMS'],
          required: true,
        },
        minutesBefore: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    metadata: {
      appointmentId: {
        type: Schema.Types.ObjectId,
        ref: 'Appointment',
      },
      patientId: {
        type: Schema.Types.ObjectId,
        ref: 'Patient',
      },
      doctorId: {
        type: Schema.Types.ObjectId,
        ref: 'Doctor',
      },
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for common queries
schema.index({ organizer: 1, startDate: -1 });
schema.index({ attendees: 1, startDate: -1 });
schema.index({ startDate: 1, endDate: 1 });
schema.index({ eventType: 1, status: 1 });
schema.index({ 'metadata.doctorId': 1, startDate: 1 });
schema.index({ 'metadata.patientId': 1, startDate: 1 });

// Validation to ensure endDate is after startDate
schema.pre('save', function (next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  } else {
    next();
  }
});

export const CalendarEventModel = model<CalendarEvent>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);

import { Schema, model, Types } from 'mongoose';

export const DOCUMENT_NAME = 'NotificationSettings';
export const COLLECTION_NAME = 'notification_settings';

export default interface NotificationSettings {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  email: {
    enabled: boolean;
    appointment: boolean;
    prescription: boolean;
    payment: boolean;
    system: boolean;
  };
  push: {
    enabled: boolean;
    appointment: boolean;
    prescription: boolean;
    payment: boolean;
    system: boolean;
  };
  sms: {
    enabled: boolean;
    appointment: boolean;
    prescription: boolean;
    payment: boolean;
    system: boolean;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<NotificationSettings>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    email: {
      enabled: {
        type: Schema.Types.Boolean,
        default: true,
      },
      appointment: {
        type: Schema.Types.Boolean,
        default: true,
      },
      prescription: {
        type: Schema.Types.Boolean,
        default: true,
      },
      payment: {
        type: Schema.Types.Boolean,
        default: true,
      },
      system: {
        type: Schema.Types.Boolean,
        default: true,
      },
    },
    push: {
      enabled: {
        type: Schema.Types.Boolean,
        default: true,
      },
      appointment: {
        type: Schema.Types.Boolean,
        default: true,
      },
      prescription: {
        type: Schema.Types.Boolean,
        default: true,
      },
      payment: {
        type: Schema.Types.Boolean,
        default: true,
      },
      system: {
        type: Schema.Types.Boolean,
        default: true,
      },
    },
    sms: {
      enabled: {
        type: Schema.Types.Boolean,
        default: true,
      },
      appointment: {
        type: Schema.Types.Boolean,
        default: true,
      },
      prescription: {
        type: Schema.Types.Boolean,
        default: true,
      },
      payment: {
        type: Schema.Types.Boolean,
        default: true,
      },
      system: {
        type: Schema.Types.Boolean,
        default: true,
      },
    },
    createdAt: {
      type: Schema.Types.Date,
      required: true,
      select: false,
    },
    updatedAt: {
      type: Schema.Types.Date,
      required: true,
      select: false,
    },
  },
  {
    versionKey: false,
  },
);

export const NotificationSettingsModel = model<NotificationSettings>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME,
);

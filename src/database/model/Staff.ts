import { Schema, model, Types } from 'mongoose';

export const DOCUMENT_NAME = 'Staff';
export const COLLECTION_NAME = 'staff';

export enum StaffRole {
  NURSE = 'NURSE',
  ADMIN = 'ADMIN',
  RECEPTIONIST = 'RECEPTIONIST',
  TECHNICIAN = 'TECHNICIAN',
  PHARMACIST = 'PHARMACIST',
  CLEANER = 'CLEANER',
  SECURITY = 'SECURITY',
  MANAGER = 'MANAGER',
  HR = 'HR',
  ACCOUNTANT = 'ACCOUNTANT',
  OTHER = 'OTHER',
}

export default interface Staff {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  employeeId?: string;
  role: StaffRole;
  department?: string;
  position?: string;
  hireDate?: Date;
  salary?: number;
  contactNumber?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  schedule?: {
    monday?: string[];
    tuesday?: string[];
    wednesday?: string[];
    thursday?: string[];
    friday?: string[];
    saturday?: string[];
    sunday?: string[];
  };
  permissions?: string[];
  status?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<Staff>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employeeId: {
      type: Schema.Types.String,
      unique: true,
      sparse: true,
    },
    role: {
      type: Schema.Types.String,
      enum: Object.values(StaffRole),
      required: true,
    },
    department: {
      type: Schema.Types.String,
    },
    position: {
      type: Schema.Types.String,
    },
    hireDate: {
      type: Schema.Types.Date,
    },
    salary: {
      type: Schema.Types.Number,
    },
    contactNumber: {
      type: Schema.Types.String,
    },
    emergencyContact: {
      name: {
        type: Schema.Types.String,
      },
      relationship: {
        type: Schema.Types.String,
      },
      phone: {
        type: Schema.Types.String,
      },
    },
    schedule: {
      monday: [
        {
          type: Schema.Types.String,
        },
      ],
      tuesday: [
        {
          type: Schema.Types.String,
        },
      ],
      wednesday: [
        {
          type: Schema.Types.String,
        },
      ],
      thursday: [
        {
          type: Schema.Types.String,
        },
      ],
      friday: [
        {
          type: Schema.Types.String,
        },
      ],
      saturday: [
        {
          type: Schema.Types.String,
        },
      ],
      sunday: [
        {
          type: Schema.Types.String,
        },
      ],
    },
    permissions: [
      {
        type: Schema.Types.String,
      },
    ],
    status: {
      type: Schema.Types.Boolean,
      default: true,
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

schema.index({ user: 1 });
schema.index({ employeeId: 1 });
schema.index({ role: 1 });
schema.index({ status: 1 });

export const StaffModel = model<Staff>(DOCUMENT_NAME, schema, COLLECTION_NAME);

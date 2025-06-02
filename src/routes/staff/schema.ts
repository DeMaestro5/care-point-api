import Joi from 'joi';
import { StaffRole } from '../../database/model/Staff';

export default {
  staffId: Joi.object().keys({
    id: Joi.string().required(),
  }),
  searchStaff: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).max(100).default(10).optional(),
    role: Joi.string()
      .valid(...Object.values(StaffRole))
      .optional(),
    department: Joi.string().optional(),
    status: Joi.string().valid('true', 'false').optional(),
    search: Joi.string().min(1).optional(),
  }),
  createStaff: Joi.object().keys({
    user: Joi.string().required(),
    employeeId: Joi.string().optional(),
    role: Joi.string()
      .valid(...Object.values(StaffRole))
      .required(),
    department: Joi.string().optional(),
    position: Joi.string().optional(),
    hireDate: Joi.date().optional(),
    salary: Joi.number().min(0).optional(),
    contactNumber: Joi.string().optional(),
    emergencyContact: Joi.object({
      name: Joi.string().required(),
      relationship: Joi.string().required(),
      phone: Joi.string().required(),
    }).optional(),
    permissions: Joi.array().items(Joi.string()).optional(),
  }),
  updateStaff: Joi.object().keys({
    employeeId: Joi.string().optional(),
    role: Joi.string()
      .valid(...Object.values(StaffRole))
      .optional(),
    department: Joi.string().optional(),
    position: Joi.string().optional(),
    hireDate: Joi.date().optional(),
    salary: Joi.number().min(0).optional(),
    contactNumber: Joi.string().optional(),
    emergencyContact: Joi.object({
      name: Joi.string().required(),
      relationship: Joi.string().required(),
      phone: Joi.string().required(),
    }).optional(),
    permissions: Joi.array().items(Joi.string()).optional(),
    status: Joi.boolean().optional(),
  }),
  updateSchedule: Joi.object().keys({
    schedule: Joi.object({
      monday: Joi.array().items(Joi.string()).optional(),
      tuesday: Joi.array().items(Joi.string()).optional(),
      wednesday: Joi.array().items(Joi.string()).optional(),
      thursday: Joi.array().items(Joi.string()).optional(),
      friday: Joi.array().items(Joi.string()).optional(),
      saturday: Joi.array().items(Joi.string()).optional(),
      sunday: Joi.array().items(Joi.string()).optional(),
    }).required(),
  }),
  createRole: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().optional(),
    permissions: Joi.array().items(Joi.string()).required(),
  }),
};

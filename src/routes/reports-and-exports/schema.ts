import Joi from 'joi';

export default {
  generateReport: Joi.object().keys({
    title: Joi.string().required().min(3).max(100),
    type: Joi.string()
      .valid('appointments', 'patients', 'inventory', 'sales', 'custom')
      .required(),
    dateRange: Joi.object({
      startDate: Joi.date().required(),
      endDate: Joi.date().min(Joi.ref('startDate')).required(),
    }).required(),
    filters: Joi.object({
      status: Joi.string().optional(),
      doctorId: Joi.string().optional(),
      patientId: Joi.string().optional(),
      pharmacyId: Joi.string().optional(),
      department: Joi.string().optional(),
    }).optional(),
    format: Joi.string().valid('pdf', 'csv', 'excel').default('pdf'),
    includeDetails: Joi.boolean().default(true),
    groupBy: Joi.string()
      .valid('date', 'doctor', 'patient', 'status', 'department')
      .optional(),
  }),
  exportParams: Joi.object().keys({
    format: Joi.string().valid('csv', 'excel', 'json').default('csv'),
    dateRange: Joi.object({
      startDate: Joi.date().optional(),
      endDate: Joi.date().min(Joi.ref('startDate')).optional(),
    }).optional(),
    filters: Joi.object({
      status: Joi.string().optional(),
      doctorId: Joi.string().optional(),
      patientId: Joi.string().optional(),
      pharmacyId: Joi.string().optional(),
    }).optional(),
    limit: Joi.number().min(1).max(10000).default(1000),
  }),
};

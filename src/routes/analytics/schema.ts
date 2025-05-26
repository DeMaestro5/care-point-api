import Joi from 'joi';

export default {
  getPatientAnalytics: Joi.object({
    query: Joi.object({
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
    }),
  }),

  getDoctorAnalytics: Joi.object({
    query: Joi.object({
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
    }),
  }),

  getPharmacyAnalytics: Joi.object({
    query: Joi.object({
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
    }),
  }),

  getAppointmentAnalytics: Joi.object({
    query: Joi.object({
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
      groupBy: Joi.string().valid('day', 'week', 'month').default('day'),
    }),
  }),

  getRevenueAnalytics: Joi.object({
    query: Joi.object({
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
      groupBy: Joi.string().valid('day', 'week', 'month').default('day'),
      type: Joi.string()
        .valid('appointments', 'prescriptions', 'all')
        .default('all'),
    }),
  }),

  getHealthcareTrends: Joi.object({
    query: Joi.object({
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
      type: Joi.string()
        .valid('conditions', 'medications', 'specialties')
        .required(),
    }),
  }),

  generateReport: Joi.object({
    query: Joi.object({
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
      type: Joi.string()
        .valid('appointments', 'revenue', 'patients', 'doctors', 'pharmacies')
        .required(),
      format: Joi.string().valid('pdf', 'csv', 'excel').default('pdf'),
    }),
  }),

  getDashboardData: Joi.object({
    params: Joi.object({
      type: Joi.string()
        .valid('admin', 'doctor', 'pharmacy', 'patient')
        .required(),
    }),
    query: Joi.object({
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
    }),
  }),
};

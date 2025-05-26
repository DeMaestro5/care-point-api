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
};

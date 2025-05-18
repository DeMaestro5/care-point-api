import Joi from 'joi';

export default {
  addCoverage: Joi.object().keys({
    area: Joi.string().required().min(3).max(100),
    radius: Joi.number().required().min(1).max(100),
    priority: Joi.number().min(1).max(5).default(3),
    operatingHours: Joi.array()
      .items(
        Joi.object({
          day: Joi.string()
            .valid(
              'monday',
              'tuesday',
              'wednesday',
              'thursday',
              'friday',
              'saturday',
              'sunday',
            )
            .required(),
          startTime: Joi.string()
            .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),
          endTime: Joi.string()
            .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),
        }),
      )
      .min(1),
    restrictions: Joi.array().items(Joi.string()),
    notes: Joi.string().max(500),
    isActive: Joi.boolean().default(true),
  }),
  updateCoverage: Joi.object().keys({
    area: Joi.string().min(3).max(100),
    radius: Joi.number().min(1).max(100),
    priority: Joi.number().min(1).max(5),
    operatingHours: Joi.array()
      .items(
        Joi.object({
          day: Joi.string()
            .valid(
              'monday',
              'tuesday',
              'wednesday',
              'thursday',
              'friday',
              'saturday',
              'sunday',
            )
            .required(),
          startTime: Joi.string()
            .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),
          endTime: Joi.string()
            .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),
        }),
      )
      .min(1),
    restrictions: Joi.array().items(Joi.string()),
    notes: Joi.string().max(500),
    isActive: Joi.boolean(),
  }),
  deleteCoverage: Joi.object().keys({
    coverageId: Joi.string().required(),
  }),

  createEmergencyRequest: Joi.object({
    patientId: Joi.string().required(),
    location: Joi.object({
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      address: Joi.string().required(),
    }).required(),
    description: Joi.string().required(),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').required(),
  }),
};

import Joi from 'joi';

const timeSlotSchema = Joi.object({
  start: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.pattern.base': 'Time must be in HH:MM format',
    }),
  end: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.pattern.base': 'Time must be in HH:MM format',
    }),
});

const dayScheduleSchema = Joi.object({
  isOpen: Joi.boolean().required(),
  slots: Joi.array().items(timeSlotSchema).default([]),
});

export default {
  // Settings route validation

  updateSettings: Joi.object().keys({
    settings: Joi.object()
      .pattern(
        Joi.string(),
        Joi.alternatives().try(
          Joi.string(),
          Joi.number(),
          Joi.boolean(),
          Joi.object(),
          Joi.array(),
        ),
      )
      .required(),
  }),

  // Operational hours validation
  updateOperationalHours: Joi.object().keys({
    monday: dayScheduleSchema.optional(),
    tuesday: dayScheduleSchema.optional(),
    wednesday: dayScheduleSchema.optional(),
    thursday: dayScheduleSchema.optional(),
    friday: dayScheduleSchema.optional(),
    saturday: dayScheduleSchema.optional(),
    sunday: dayScheduleSchema.optional(),
    timezone: Joi.string().optional().default('UTC'),
  }),

  // Holiday validation
  createHoliday: Joi.object().keys({
    name: Joi.string().required().trim().min(1).max(255),
    date: Joi.date().required(),
    type: Joi.string()
      .valid('NATIONAL', 'RELIGIOUS', 'LOCAL', 'CUSTOM')
      .required(),
    operationalStatus: Joi.string()
      .valid('CLOSED', 'LIMITED', 'EMERGENCY_ONLY')
      .default('CLOSED'),
    description: Joi.string().trim().max(1000).optional(),
    isRecurring: Joi.boolean().default(false),
    isActive: Joi.boolean().default(true),
  }),

  updateHoliday: Joi.object().keys({
    name: Joi.string().trim().min(1).max(255).optional(),
    date: Joi.date().optional(),
    type: Joi.string()
      .valid('NATIONAL', 'RELIGIOUS', 'LOCAL', 'CUSTOM')
      .optional(),
    operationalStatus: Joi.string()
      .valid('CLOSED', 'LIMITED', 'EMERGENCY_ONLY')
      .optional(),
    description: Joi.string().trim().max(1000).optional(),
    isRecurring: Joi.boolean().optional(),
    isActive: Joi.boolean().optional(),
  }),

  holidayId: Joi.object().keys({
    id: Joi.string().required(),
  }),

  holidayQuery: Joi.object().keys({
    year: Joi.number().integer().min(1900).max(3000).optional(),
    month: Joi.number().integer().min(0).max(11).optional(),
    type: Joi.string()
      .valid('NATIONAL', 'RELIGIOUS', 'LOCAL', 'CUSTOM')
      .optional(),
    upcoming: Joi.boolean().optional(),
    limit: Joi.number().integer().min(1).max(100).default(10).optional(),
  }),

  bulkHolidays: Joi.object().keys({
    holidays: Joi.array()
      .items(
        Joi.object().keys({
          name: Joi.string().required().trim().min(1).max(255),
          date: Joi.date().required(),
          type: Joi.string()
            .valid('NATIONAL', 'RELIGIOUS', 'LOCAL', 'CUSTOM')
            .required(),
          operationalStatus: Joi.string()
            .valid('CLOSED', 'LIMITED', 'EMERGENCY_ONLY')
            .default('CLOSED'),
          description: Joi.string().trim().max(1000).optional(),
          isRecurring: Joi.boolean().default(false),
          isActive: Joi.boolean().default(true),
        }),
      )
      .required()
      .min(1),
  }),
};

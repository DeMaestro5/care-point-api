import Joi from 'joi';

export default {
  getUserCalendar: Joi.object().keys({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
    eventType: Joi.string()
      .valid('APPOINTMENT', 'MEETING', 'REMINDER', 'BREAK', 'OTHER')
      .optional(),
    status: Joi.string()
      .valid('scheduled', 'completed', 'cancelled')
      .optional(),
  }),

  listEvents: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
    eventType: Joi.string()
      .valid('APPOINTMENT', 'MEETING', 'REMINDER', 'BREAK', 'OTHER')
      .optional(),
    status: Joi.string()
      .valid('scheduled', 'completed', 'cancelled')
      .optional(),
    organizerId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional(),
  }),

  createEvent: Joi.object().keys({
    title: Joi.string().required().trim().max(200),
    description: Joi.string().trim().max(1000).optional(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
    allDay: Joi.boolean().default(false),
    location: Joi.string().trim().max(300).optional(),
    attendees: Joi.array()
      .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
      .default([]),
    eventType: Joi.string()
      .valid('APPOINTMENT', 'MEETING', 'REMINDER', 'BREAK', 'OTHER')
      .default('OTHER'),
    recurrence: Joi.object()
      .keys({
        frequency: Joi.string()
          .valid('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY')
          .required(),
        interval: Joi.number().integer().min(1).default(1),
        endDate: Joi.date().iso().optional(),
        count: Joi.number().integer().min(1).optional(),
      })
      .optional(),
    reminders: Joi.array()
      .items(
        Joi.object().keys({
          type: Joi.string().valid('EMAIL', 'PUSH', 'SMS').required(),
          minutesBefore: Joi.number().integer().min(0).required(),
        }),
      )
      .default([]),
    metadata: Joi.object()
      .keys({
        appointmentId: Joi.string()
          .regex(/^[0-9a-fA-F]{24}$/)
          .optional(),
        patientId: Joi.string()
          .regex(/^[0-9a-fA-F]{24}$/)
          .optional(),
        doctorId: Joi.string()
          .regex(/^[0-9a-fA-F]{24}$/)
          .optional(),
      })
      .optional(),
  }),

  updateEvent: Joi.object().keys({
    title: Joi.string().trim().max(200).optional(),
    description: Joi.string().trim().max(1000).optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    allDay: Joi.boolean().optional(),
    location: Joi.string().trim().max(300).optional(),
    attendees: Joi.array()
      .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
      .optional(),
    eventType: Joi.string()
      .valid('APPOINTMENT', 'MEETING', 'REMINDER', 'BREAK', 'OTHER')
      .optional(),
    status: Joi.string()
      .valid('scheduled', 'completed', 'cancelled')
      .optional(),
    recurrence: Joi.object()
      .keys({
        frequency: Joi.string()
          .valid('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY')
          .required(),
        interval: Joi.number().integer().min(1).default(1),
        endDate: Joi.date().iso().optional(),
        count: Joi.number().integer().min(1).optional(),
      })
      .optional(),
    reminders: Joi.array()
      .items(
        Joi.object().keys({
          type: Joi.string().valid('EMAIL', 'PUSH', 'SMS').required(),
          minutesBefore: Joi.number().integer().min(0).required(),
        }),
      )
      .optional(),
    metadata: Joi.object()
      .keys({
        appointmentId: Joi.string()
          .regex(/^[0-9a-fA-F]{24}$/)
          .optional(),
        patientId: Joi.string()
          .regex(/^[0-9a-fA-F]{24}$/)
          .optional(),
        doctorId: Joi.string()
          .regex(/^[0-9a-fA-F]{24}$/)
          .optional(),
      })
      .optional(),
  }),

  checkAvailability: Joi.object().keys({
    userIds: Joi.alternatives()
      .try(
        Joi.string()
          .regex(/^[0-9a-fA-F]{24}$/)
          .required(),
        Joi.string()
          .pattern(/^[0-9a-fA-F]{24}(,[0-9a-fA-F]{24})*$/)
          .required(),
        Joi.array()
          .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
          .min(1)
          .required(),
      )
      .required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
  }),

  eventId: Joi.object().keys({
    eventId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),
  }),

  userId: Joi.object().keys({
    userId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),
  }),
};

import Joi from 'joi';

export default {
  getAuditLogs: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    action: Joi.string(),
    entityType: Joi.string(),
    entityId: Joi.string(),
    userId: Joi.string(),
    userRole: Joi.string(),
    startDate: Joi.date(),
    endDate: Joi.date().min(Joi.ref('startDate')),
  }),

  getSystemStats: Joi.object({
    startDate: Joi.date(),
    endDate: Joi.date().min(Joi.ref('startDate')),
  }),

  bulkAppointments: Joi.object({
    appointments: Joi.array()
      .items(
        Joi.object({
          patientId: Joi.string().required(),
          doctorId: Joi.string().required(),
          appointmentDate: Joi.date().required(),
          status: Joi.string()
            .valid('scheduled', 'completed', 'cancelled', 'rescheduled')
            .default('scheduled'),
          reason: Joi.string(),
          appointmentType: Joi.string()
            .valid(
              'CHECK_UP',
              'FOLLOW_UP',
              'EMERGENCY',
              'CONSULTATION',
              'OTHER',
            )
            .default('CHECK_UP'),
          time: Joi.string(),
          notes: Joi.string(),
        }),
      )
      .min(1)
      .required(),
  }),

  bulkNotifications: Joi.object({
    recipients: Joi.array()
      .items(
        Joi.object({
          userId: Joi.string().required(),
          type: Joi.string()
            .valid('APPOINTMENT', 'PRESCRIPTION', 'PAYMENT', 'SYSTEM', 'OTHER')
            .required(),
          title: Joi.string().required(),
          message: Joi.string().required(),
          data: Joi.object(),
          user: Joi.string().required(),
        }),
      )
      .min(1)
      .required(),
  }),
};

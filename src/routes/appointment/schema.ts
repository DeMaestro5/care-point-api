import Joi from 'joi';

export default {
  searchAppointments: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().valid(
      'scheduled',
      'completed',
      'cancelled',
      'rescheduled',
    ),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')),
    doctorId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    patientId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
  }),

  createAppointment: Joi.object().keys({
    doctorId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),
    patientId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),
    appointmentDate: Joi.date().iso().required(),
    reason: Joi.string().required().trim(),
    notes: Joi.string().trim().optional(),
  }),
};

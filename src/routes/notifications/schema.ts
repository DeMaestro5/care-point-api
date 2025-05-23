import Joi from 'joi';

export default {
  listNotifications: Joi.object().keys({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
  }),
  notificationId: Joi.object().keys({
    id: Joi.string().required(),
  }),
  createNotification: Joi.object().keys({
    title: Joi.string().required(),
    user: Joi.string().required(),
    message: Joi.string().required(),
    type: Joi.string()
      .valid('APPOINTMENT', 'PRESCRIPTION', 'PAYMENT', 'SYSTEM', 'OTHER')
      .required(),
    data: Joi.object().optional(),
  }),
  updateSettings: Joi.object().keys({
    email: Joi.object({
      enabled: Joi.boolean(),
      appointment: Joi.boolean(),
      prescription: Joi.boolean(),
      payment: Joi.boolean(),
      system: Joi.boolean(),
    }),
    push: Joi.object({
      enabled: Joi.boolean(),
      appointment: Joi.boolean(),
      prescription: Joi.boolean(),
      payment: Joi.boolean(),
      system: Joi.boolean(),
    }),
    sms: Joi.object({
      enabled: Joi.boolean(),
      appointment: Joi.boolean(),
      prescription: Joi.boolean(),
      payment: Joi.boolean(),
      system: Joi.boolean(),
    }),
  }),
};

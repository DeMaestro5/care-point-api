import Joi from 'joi';

export default {
  messageId: Joi.object().keys({
    id: Joi.string().required(),
  }),
  conversationId: Joi.object().keys({
    id: Joi.string().required(),
  }),
  createMessage: Joi.object().keys({
    recipients: Joi.array().items(Joi.string()).min(1).required(),
    subject: Joi.string().trim().max(200).optional(),
    content: Joi.string().trim().min(1).required(),
    messageType: Joi.string()
      .valid('TEXT', 'APPOINTMENT', 'PRESCRIPTION', 'REFERRAL', 'SYSTEM')
      .default('TEXT'),
    priority: Joi.string()
      .valid('LOW', 'NORMAL', 'HIGH', 'URGENT')
      .default('NORMAL'),
    attachments: Joi.array().items(Joi.string()).optional(),
    metadata: Joi.object().optional(),
  }),
  updateMessageStatus: Joi.object().keys({
    status: Joi.string().valid('SENT', 'DELIVERED', 'READ').required(),
  }),
  createBroadcastMessage: Joi.object().keys({
    title: Joi.string().trim().min(1).max(200).required(),
    content: Joi.string().trim().min(1).required(),
    targetAudience: Joi.string()
      .valid('ALL', 'PATIENTS', 'DOCTORS', 'STAFF', 'SPECIFIC')
      .required(),
    specificRecipients: Joi.when('targetAudience', {
      is: 'SPECIFIC',
      then: Joi.array().items(Joi.string()).min(1).required(),
      otherwise: Joi.array().items(Joi.string()).optional(),
    }),
    messageType: Joi.string()
      .valid('ANNOUNCEMENT', 'ALERT', 'UPDATE', 'MAINTENANCE')
      .default('ANNOUNCEMENT'),
    priority: Joi.string()
      .valid('LOW', 'NORMAL', 'HIGH', 'URGENT')
      .default('NORMAL'),
    scheduledAt: Joi.date().optional(),
    expiresAt: Joi.date().optional(),
    attachments: Joi.array().items(Joi.string()).optional(),
    metadata: Joi.object().optional(),
  }),
  listMessages: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    status: Joi.string().valid('SENT', 'DELIVERED', 'READ').optional(),
    messageType: Joi.string()
      .valid('TEXT', 'APPOINTMENT', 'PRESCRIPTION', 'REFERRAL', 'SYSTEM')
      .optional(),
    priority: Joi.string().valid('LOW', 'NORMAL', 'HIGH', 'URGENT').optional(),
  }),
  listBroadcastMessages: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    status: Joi.string()
      .valid('DRAFT', 'SCHEDULED', 'SENT', 'CANCELLED')
      .optional(),
    targetAudience: Joi.string()
      .valid('ALL', 'PATIENTS', 'DOCTORS', 'STAFF', 'SPECIFIC')
      .optional(),
  }),
};

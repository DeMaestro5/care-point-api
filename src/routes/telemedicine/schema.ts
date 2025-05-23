import Joi from 'joi';

export default {
  sessionId: Joi.object({
    id: Joi.string().required(),
  }),
  updateStatus: Joi.object({
    status: Joi.string()
      .valid('scheduled', 'in-progress', 'completed', 'cancelled')
      .required(),
  }),
  createSession: Joi.object({
    patient: Joi.string().required(),
    doctor: Joi.string().required(),
    startTime: Joi.date().required(),
    meetingLink: Joi.string().optional(),
    notes: Joi.string().optional(),
  }),
  chatMessage: Joi.object({
    message: Joi.string().required().min(1).max(1000),
  }),
  toggleRecording: Joi.object({
    isRecording: Joi.boolean().required(),
  }),
};

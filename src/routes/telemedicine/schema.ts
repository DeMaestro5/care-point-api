import Joi from 'joi';

const createSession = Joi.object({
  patient: Joi.string().required(),
  doctor: Joi.string().required(),
  startTime: Joi.date().required(),
  meetingLink: Joi.string().optional(),
  notes: Joi.string().optional(),
});

const sessionId = Joi.object({
  id: Joi.string().required(),
});

export default {
  createSession,
  sessionId,
};

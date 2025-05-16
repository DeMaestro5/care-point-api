import Joi from 'joi';

export default {
  listPrescriptions: Joi.object().keys({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    status: Joi.string().valid('ACTIVE', 'COMPLETED', 'CANCELLED').optional(),
    patientId: Joi.string().optional(),
    doctorId: Joi.string().optional(),
    pharmacyId: Joi.string().optional(),
  }),
};

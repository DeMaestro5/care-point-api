import Joi from 'joi';

export default {
  verifyInsurance: Joi.object().keys({
    patientId: Joi.string().required(),
    provider: Joi.string().required(),
    policyNumber: Joi.string().required(),
    serviceType: Joi.string().required(),
    amount: Joi.number().required(),
  }),

  submitClaim: Joi.object().keys({
    patientId: Joi.string().required(),
    insuranceId: Joi.string().required(),
    serviceType: Joi.string().required(),
    amount: Joi.number().required(),
    description: Joi.string().required(),
    documents: Joi.array().items(Joi.string()).optional(),
    dateOfService: Joi.date().required(),
  }),

  coverage: Joi.object().keys({
    patientId: Joi.string().required(),
    serviceType: Joi.string().required(),
  }),
};

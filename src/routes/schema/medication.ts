import Joi from 'joi';

export const searchMedications = Joi.object({
  query: Joi.object({
    query: Joi.string().allow(''),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
  }),
});

export const getMedication = Joi.object({
  params: Joi.object({
    id: Joi.string().required(),
  }),
});

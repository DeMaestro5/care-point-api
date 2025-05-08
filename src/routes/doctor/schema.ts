import Joi from 'joi';

export default {
  doctorId: Joi.object().keys({
    id: Joi.string().required(),
  }),
  searchDoctors: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    specialization: Joi.string().trim(),
    status: Joi.boolean(),
    search: Joi.string().trim(),
  }),
};

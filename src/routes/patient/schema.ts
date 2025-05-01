import Joi from 'joi';

export default {
  patientId: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

import Joi from 'joi';

export default {
  doctorId: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

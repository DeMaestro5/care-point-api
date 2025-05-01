import Joi from 'joi';

export default {
  ambulanceId: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

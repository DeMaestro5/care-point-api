import Joi from 'joi';

export default {
  pharmacyId: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

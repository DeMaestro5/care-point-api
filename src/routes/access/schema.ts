import Joi from 'joi';
import { JoiAuthBearer } from '../../helpers/validator';
import { RoleCode } from '../../database/model/Role';

export default {
  credential: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
  }),
  refreshToken: Joi.object().keys({
    refreshToken: Joi.string().required().min(1),
  }),
  auth: Joi.object()
    .keys({
      authorization: JoiAuthBearer().required(),
    })
    .unknown(true),
  signup: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    profilePicUrl: Joi.string().required().uri(),
    role: Joi.string()
      .valid(...Object.values(RoleCode))
      .required(),
  }),
  forgotPassword: Joi.object().keys({
    email: Joi.string().required().email(),
  }),
  resetPassword: Joi.object().keys({
    token: Joi.string().required(),
    password: Joi.string().required().min(8),
  }),
};

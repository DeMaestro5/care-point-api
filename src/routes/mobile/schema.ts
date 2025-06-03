import Joi from 'joi';

export default {
  deviceId: Joi.object().keys({
    id: Joi.string().required(),
  }),
  registerDevice: Joi.object().keys({
    deviceId: Joi.string().required().trim(),
    deviceType: Joi.string().valid('IOS', 'ANDROID').required(),
    deviceName: Joi.string().optional().trim(),
    pushToken: Joi.string().optional().trim(),
    appVersion: Joi.string().optional().trim(),
    osVersion: Joi.string().optional().trim(),
    metadata: Joi.object().optional(),
  }),
  updatePushToken: Joi.object().keys({
    pushToken: Joi.string().required().trim(),
  }),
};

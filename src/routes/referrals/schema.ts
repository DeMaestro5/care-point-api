import Joi from 'joi';
import { ReferralStatus } from '../../database/model/Referral';

export default {
  createReferral: Joi.object({
    patientId: Joi.string().required(),
    referredTo: Joi.string().required(),
    reason: Joi.string().required(),
    notes: Joi.string(),
    appointmentDate: Joi.date(),
  }),

  updateReferralStatus: Joi.object({
    status: Joi.string()
      .valid(...Object.values(ReferralStatus))
      .required(),
    notes: Joi.string(),
    appointmentDate: Joi.date(),
  }),
};

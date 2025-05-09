import Joi from 'joi';

export default {
  pharmacyId: Joi.object().keys({
    id: Joi.string().required(),
  }),

  listPharmacies: Joi.object().keys({
    name: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
  }),

  updatePharmacy: Joi.object().keys({
    name: Joi.string().optional(),
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    phone: Joi.string().optional(),
    email: Joi.string().email().optional(),
    licenseNumber: Joi.string().optional(),
    operatingHours: Joi.string().optional(),
  }),
};

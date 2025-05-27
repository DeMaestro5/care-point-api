import Joi from 'joi';

export default {
  getMedication: Joi.object({
    params: Joi.object({
      id: Joi.string().required(),
    }),
  }),

  getAlternatives: Joi.object({
    params: Joi.object({
      id: Joi.string().required(),
    }),
  }),

  getInteractions: Joi.object({
    params: Joi.object({
      id: Joi.string().required(),
    }),
  }),

  getCategories: Joi.object({}),

  getAvailability: Joi.object({
    params: Joi.object({
      id: Joi.string().required(),
    }),
  }),

  batchInventoryUpdate: Joi.object({
    params: Joi.object({
      id: Joi.string().required(),
    }),
    body: Joi.object({
      updates: Joi.array()
        .items(
          Joi.object({
            medicationId: Joi.string().required(),
            quantity: Joi.number().min(0).required(),
            price: Joi.number().min(0).required(),
            expiryDate: Joi.date().optional(),
            batchNumber: Joi.string().optional(),
          }),
        )
        .required(),
    }),
  }),
};

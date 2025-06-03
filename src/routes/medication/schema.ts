import Joi from 'joi';

export default {
  createMedication: Joi.object({
    name: Joi.string().required().trim(),
    genericName: Joi.string().required().trim(),
    description: Joi.string().optional().trim(),
    category: Joi.string().required().trim(),
    unit: Joi.string().required().trim(),
    manufacturer: Joi.string().required().trim(),
    dosageForm: Joi.string().required().trim(),
    strength: Joi.string().required().trim(),
    prescriptionRequired: Joi.boolean().optional().default(false),
    sideEffects: Joi.array().items(Joi.string().trim()).optional(),
    contraindications: Joi.array().items(Joi.string().trim()).optional(),
    storageInstructions: Joi.string().optional().trim(),
  }),

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
    updates: Joi.array().items(
      Joi.object({
        medicationId: Joi.string().required(),
        unit: Joi.string().required(),
        quantity: Joi.number().min(0).required(),
        price: Joi.number().min(0).required(),
        expiryDate: Joi.date().optional(),
        batchNumber: Joi.string().optional(),
      }),
    ),
  }),

  listMedications: Joi.object({
    query: Joi.string().allow('').optional().default(''),
    page: Joi.number().min(1).optional().default(1),
    limit: Joi.number().min(1).max(100).optional().default(10),
  }),
};

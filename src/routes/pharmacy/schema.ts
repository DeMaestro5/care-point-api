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

  listInventory: Joi.object().keys({
    page: Joi.number().min(1),
    limit: Joi.number().min(1).max(100),
  }),

  createInventory: Joi.object({
    name: Joi.string().required(),
    description: Joi.string(),
    category: Joi.string().required(),
    quantity: Joi.number().min(0).required(),
    unit: Joi.string().required(),
    price: Joi.number().min(0).required(),
    expiryDate: Joi.date(),
    batchNumber: Joi.string(),
    manufacturer: Joi.string(),
  }),

  updateInventory: Joi.object({
    name: Joi.string(),
    description: Joi.string(),
    category: Joi.string(),
    quantity: Joi.number().min(0),
    unit: Joi.string(),
    price: Joi.number().min(0),
    expiryDate: Joi.date(),
    batchNumber: Joi.string(),
    manufacturer: Joi.string(),
  }),

  updatePrescriptionStatus: Joi.object({
    status: Joi.string().valid('ACTIVE', 'COMPLETED', 'CANCELLED').required(),
  }),

  listPrescriptions: Joi.object().keys({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    status: Joi.string().valid('ACTIVE', 'COMPLETED', 'CANCELLED').optional(),
  }),

  createPrescription: Joi.object({
    patientId: Joi.string().required(),
    doctorId: Joi.string().required(),
    medications: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          dosage: Joi.string().required(),
          frequency: Joi.string().required(),
          duration: Joi.string().required(),
          instructions: Joi.string(),
        }),
      )
      .required(),
    diagnosis: Joi.string(),
    notes: Joi.string(),
  }),
};

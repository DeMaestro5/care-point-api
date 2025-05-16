import Joi from 'joi';

export default {
  listPrescriptions: Joi.object().keys({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    status: Joi.string().valid('ACTIVE', 'COMPLETED', 'CANCELLED').optional(),
    patientId: Joi.string().optional(),
    doctorId: Joi.string().optional(),
    pharmacyId: Joi.string().optional(),
  }),
  createPrescription: Joi.object().keys({
    patientId: Joi.string().required(),
    pharmacyId: Joi.string().required(),
    medications: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          dosage: Joi.string().required(),
          frequency: Joi.string().required(),
          duration: Joi.string().required(),
          instructions: Joi.string().optional(),
        }),
      )
      .required(),
    diagnosis: Joi.string().required(),
    notes: Joi.string().optional(),
  }),
};

import Joi from 'joi';

export default {
  patientId: Joi.object().keys({
    id: Joi.string().required(),
  }),
  updatePatient: Joi.object().keys({
    dateOfBirth: Joi.date().optional(),
    gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').optional(),
    bloodGroup: Joi.string()
      .valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
      .optional(),
    height: Joi.number().optional(),
    weight: Joi.number().optional(),
    allergies: Joi.array().items(Joi.string()).optional(),
    emergencyContact: Joi.object({
      name: Joi.string().required(),
      phone: Joi.string().required(),
      relationship: Joi.string().required(),
    }).optional(),
  }),
  medicalHistory: Joi.object().keys({
    condition: Joi.string().required(),
    diagnosis: Joi.string().required(),
    diagnosisDate: Joi.date().required(),
    treatment: Joi.string().required(),
    date: Joi.date().required(),
    notes: Joi.string().optional(),
  }),
};

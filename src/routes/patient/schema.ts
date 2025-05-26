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
  prescription: Joi.object().keys({
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
    diagnosis: Joi.string().optional(),
    notes: Joi.string().optional(),
  }),
  appointment: Joi.object().keys({
    appointmentDate: Joi.date().required(),
    status: Joi.string()
      .valid('scheduled', 'completed', 'cancelled', 'rescheduled')
      .default('scheduled'),
    reason: Joi.string().required().trim(),
    notes: Joi.string().trim().optional(),
  }),
  updateAppointment: Joi.object().keys({
    appointmentDate: Joi.date().optional(),
    status: Joi.string()
      .valid('scheduled', 'completed', 'cancelled', 'rescheduled')
      .optional(),
    reason: Joi.string().trim().optional(),
    notes: Joi.string().trim().optional(),
  }),
  medicalRecord: Joi.object().keys({
    diagnosis: Joi.string().required().min(3),
    treatment: Joi.string().required().min(3),
    notes: Joi.string().optional(),
    attachments: Joi.array().items(Joi.string()).optional(),
  }),
  updateAllergies: Joi.object().keys({
    allergies: Joi.array().items(Joi.string()).required(),
  }),
  insurance: Joi.object().keys({
    provider: Joi.string().required(),
    policyNumber: Joi.string().required(),
    groupNumber: Joi.string().optional(),
    coverageType: Joi.string()
      .valid('PRIMARY', 'SECONDARY', 'TERTIARY')
      .required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().optional(),
    isActive: Joi.boolean().default(true),
    notes: Joi.string().optional(),
  }),
  vitalSigns: Joi.object().keys({
    bloodPressure: Joi.object({
      systolic: Joi.number().min(0).optional(),
      diastolic: Joi.number().min(0).optional(),
    }).optional(),
    heartRate: Joi.number().min(0).optional(),
    temperature: Joi.number().min(0).optional(),
    respiratoryRate: Joi.number().min(0).optional(),
    oxygenSaturation: Joi.number().min(0).max(100).optional(),
    weight: Joi.number().min(0).optional(),
    height: Joi.number().min(0).optional(),
    notes: Joi.string().optional(),
  }),
};

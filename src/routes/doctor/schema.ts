import Joi from 'joi';

export default {
  doctorId: Joi.object().keys({
    id: Joi.string().required(),
  }),
  searchDoctors: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    specialization: Joi.string().trim(),
    status: Joi.boolean(),
    search: Joi.string().trim(),
  }),
  updateDoctor: Joi.object().keys({
    specialization: Joi.string().trim(),
    licenseNumber: Joi.string().trim(),
    consultationFee: Joi.number().min(0),
    yearsOfExperience: Joi.number().min(0),
    availability: Joi.object().keys({
      monday: Joi.array().items(Joi.string()),
      tuesday: Joi.array().items(Joi.string()),
      wednesday: Joi.array().items(Joi.string()),
      thursday: Joi.array().items(Joi.string()),
      friday: Joi.array().items(Joi.string()),
      saturday: Joi.array().items(Joi.string()),
      sunday: Joi.array().items(Joi.string()),
    }),
    education: Joi.array().items(Joi.string()),
    qualification: Joi.string().trim(),
    certifications: Joi.array().items(Joi.string()),
    status: Joi.boolean(),
    hospital: Joi.string().trim(),
  }),
};

import Joi from 'joi';

export default {
  searchDoctors: Joi.object().keys({
    query: Joi.string().trim().min(1),
    specialization: Joi.string().trim(),
    hospital: Joi.string().trim(),
    minFee: Joi.number().min(0),
    maxFee: Joi.number().min(0),
    yearsOfExperience: Joi.number().min(0),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  searchPharmacies: Joi.object().keys({
    query: Joi.string().trim().min(1),
    city: Joi.string().trim(),
    state: Joi.string().trim(),
    services: Joi.array().items(Joi.string()),
    hasInsuranceSupport: Joi.boolean(),
    acceptedInsuranceProviders: Joi.array().items(Joi.string()),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  searchMedications: Joi.object().keys({
    query: Joi.string().trim().min(1),
    category: Joi.string().trim(),
    manufacturer: Joi.string().trim(),
    dosageForm: Joi.string().trim(),
    prescriptionRequired: Joi.boolean(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  searchServices: Joi.object().keys({
    query: Joi.string().trim().min(1),
    serviceType: Joi.string().valid(
      'medical',
      'pharmacy',
      'laboratory',
      'ambulance',
      'telemedicine',
    ),
    location: Joi.string().trim(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  searchNearby: Joi.object().keys({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    radius: Joi.number().min(0.1).max(100).default(10), // radius in kilometers
    facilityType: Joi.string()
      .valid('doctors', 'pharmacies', 'hospitals', 'ambulances', 'all')
      .default('all'),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),
};

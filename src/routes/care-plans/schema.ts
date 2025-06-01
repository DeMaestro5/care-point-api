import Joi from 'joi';

export default {
  createCarePlan: Joi.object({
    patientId: Joi.string().required(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
    goals: Joi.array()
      .items(
        Joi.object({
          description: Joi.string().required(),
          targetDate: Joi.date().iso().required(),
          status: Joi.string()
            .valid('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')
            .default('NOT_STARTED'),
        }),
      )
      .required(),
    activities: Joi.array()
      .items(
        Joi.object({
          description: Joi.string().required(),
          frequency: Joi.string().required(),
          duration: Joi.string().required(),
          status: Joi.string()
            .valid('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')
            .default('NOT_STARTED'),
        }),
      )
      .required(),
    assignedTo: Joi.array().items(Joi.string()).required(),
    notes: Joi.string().optional(),
  }),

  carePlanId: Joi.object({
    params: Joi.object({
      id: Joi.string().required(),
    }),
  }),

  patientId: Joi.object({
    params: Joi.object({
      id: Joi.string().required(),
    }),
  }),

  updateCarePlan: Joi.object({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
    goals: Joi.array()
      .items(
        Joi.object({
          description: Joi.string().required(),
          targetDate: Joi.date().iso().required(),
          status: Joi.string()
            .valid('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')
            .default('NOT_STARTED'),
        }),
      )
      .optional(),
    activities: Joi.array()
      .items(
        Joi.object({
          description: Joi.string().required(),
          frequency: Joi.string().required(),
          duration: Joi.string().required(),
          status: Joi.string()
            .valid('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')
            .default('NOT_STARTED'),
        }),
      )
      .optional(),
    assignedTo: Joi.array().items(Joi.string()).optional(),
    notes: Joi.string().optional(),
  }),
};

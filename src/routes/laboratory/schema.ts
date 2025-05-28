import Joi from 'joi';

export const LabOrderStatus = Joi.string().valid(
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
);

export const LabOrderSchema = Joi.object().keys({
  patientId: Joi.string().required(),
  doctorId: Joi.string().required(),
  testName: Joi.string().required(),
  description: Joi.string().optional(),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').default('MEDIUM'),
  status: LabOrderStatus.default('PENDING'),
  notes: Joi.string().optional(),
});

export const LabResultSchema = Joi.object().keys({
  labOrderId: Joi.string().required(),
  technicianId: Joi.string().required(),
  results: Joi.array()
    .items(
      Joi.object({
        testName: Joi.string().required(),
        value: Joi.string().required(),
        unit: Joi.string().optional(),
        referenceRange: Joi.string().optional(),
        interpretation: Joi.string().optional(),
      }),
    )
    .required(),
  notes: Joi.string().optional(),
  status: LabOrderStatus,
});

export const UpdateLabOrderStatusSchema = Joi.object().keys({
  status: LabOrderStatus.required(),
  notes: Joi.string().optional(),
});

export default {
  createLabOrder: Joi.object().keys({
    patientId: Joi.string().required(),
    doctorId: Joi.string().required(),
    testName: Joi.string().required(),
    description: Joi.string().optional(),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').default('MEDIUM'),
    status: LabOrderStatus.default('PENDING'),
    notes: Joi.string().optional(),
  }),

  updateLabOrderStatus: Joi.object().keys({
    status: LabOrderStatus.required(),
    notes: Joi.string().optional(),
  }),

  submitLabResults: Joi.object().keys({
    labOrderId: Joi.string().required(),
    technicianId: Joi.string().required(),
    results: Joi.array()
      .items(
        Joi.object({
          testName: Joi.string().required(),
          value: Joi.string().required(),
          unit: Joi.string().optional(),
          referenceRange: Joi.string().optional(),
          interpretation: Joi.string().optional(),
        }),
      )
      .required(),
    notes: Joi.string().optional(),
    status: LabOrderStatus.required(),
  }),
};

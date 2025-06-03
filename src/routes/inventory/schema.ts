import Joi from 'joi';

export default {
  // Transfer inventory routes
  createTransfer: Joi.object({
    fromLocation: Joi.string().required(),
    toLocation: Joi.string().required(),
    medication: Joi.string().required(),
    quantity: Joi.number().min(1).required(),
    unit: Joi.string().required(),
    batchNumber: Joi.string().optional(),
    expiryDate: Joi.date().optional(),
    transferType: Joi.string()
      .valid('INTER_PHARMACY', 'STOCK_ADJUSTMENT', 'DONATION', 'RETURN')
      .required(),
    reason: Joi.string().required(),
    notes: Joi.string().optional(),
    estimatedDelivery: Joi.date().optional(),
  }),

  updateTransferStatus: Joi.object({
    status: Joi.string()
      .valid('PENDING', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED')
      .required(),
    notes: Joi.string().optional(),
    actualCost: Joi.number().min(0).optional(),
  }),

  approveTransfer: Joi.object({
    estimatedDelivery: Joi.date().optional(),
    notes: Joi.string().optional(),
  }),

  completeTransfer: Joi.object({
    actualCost: Joi.number().min(0).optional(),
    notes: Joi.string().optional(),
  }),

  cancelTransfer: Joi.object({
    reason: Joi.string().required(),
  }),

  // Stock take routes
  createStockTake: Joi.object({
    pharmacy: Joi.string().required(),
    stockTakeDate: Joi.date().default(Date.now),
    type: Joi.string()
      .valid('FULL', 'PARTIAL', 'SPOT_CHECK', 'AUDIT')
      .required(),
    reason: Joi.string().required(),
    notes: Joi.string().optional(),
  }),

  addStockTakeItems: Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          medication: Joi.string().required(),
          expectedQuantity: Joi.number().min(0).required(),
          actualQuantity: Joi.number().min(0).required(),
          unit: Joi.string().required(),
          batchNumber: Joi.string().optional(),
          expiryDate: Joi.date().optional(),
          notes: Joi.string().optional(),
        }),
      )
      .min(1)
      .required(),
  }),

  updateStockTakeStatus: Joi.object({
    status: Joi.string()
      .valid('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
      .required(),
  }),

  reviewStockTake: Joi.object({
    notes: Joi.string().optional(),
  }),

  // Low stock and expiring alerts
  getLowStock: Joi.object({
    pharmacy: Joi.string().optional(),
    threshold: Joi.number().min(0).default(10),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20),
  }),

  getExpiringMedications: Joi.object({
    pharmacy: Joi.string().optional(),
    daysAhead: Joi.number().min(1).default(30),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20),
  }),

  // General list parameters
  listTransfers: Joi.object({
    pharmacy: Joi.string().optional(),
    status: Joi.string()
      .valid('PENDING', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED')
      .optional(),
    transferType: Joi.string()
      .valid('INTER_PHARMACY', 'STOCK_ADJUSTMENT', 'DONATION', 'RETURN')
      .optional(),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20),
  }),

  listStockTakes: Joi.object({
    pharmacy: Joi.string().optional(),
    status: Joi.string()
      .valid('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
      .optional(),
    type: Joi.string()
      .valid('FULL', 'PARTIAL', 'SPOT_CHECK', 'AUDIT')
      .optional(),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20),
  }),

  // Parameter validation
  transferId: Joi.object({
    id: Joi.string().required(),
  }),

  stockTakeId: Joi.object({
    id: Joi.string().required(),
  }),
};

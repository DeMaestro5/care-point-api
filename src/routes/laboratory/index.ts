import { Router } from 'express';
import asyncHandler from '../../helpers/asyncHandler';
import validator from '../../helpers/validator';
import schema from './schema';
import { PublicRequest } from '../../types/app-request';
import { SuccessResponse } from '../../core/ApiResponse';
import { BadRequestError } from '../../core/ApiError';
import LabOrderRepo from '../../database/repository/LabOrderRepo';
import LabResultRepo from '../../database/repository/LabResultRepo';
import { Types } from 'mongoose';
import { Response } from 'express';

const router = Router();

// Create lab test order
router.post(
  '/lab-orders',
  validator(schema.createLabOrder),
  asyncHandler(async (req: PublicRequest, res: Response) => {
    const labOrder = await LabOrderRepo.create(req.body);
    new SuccessResponse('Lab order created successfully', labOrder).send(res);
  }),
);

// Get lab order details
router.get(
  '/lab-orders/:id',
  asyncHandler(async (req: PublicRequest, res: Response) => {
    const labOrder = await LabOrderRepo.findById(
      new Types.ObjectId(req.params.id),
    );
    if (!labOrder) throw new BadRequestError('Lab order not found');
    new SuccessResponse('Lab order retrieved successfully', labOrder).send(res);
  }),
);

// Update lab order status
router.put(
  '/lab-orders/:id/status',
  validator(schema.updateLabOrderStatus),
  asyncHandler(async (req: PublicRequest, res: Response) => {
    const labOrder = await LabOrderRepo.update(
      new Types.ObjectId(req.params.id),
      { status: req.body.status, notes: req.body.notes },
    );
    if (!labOrder) throw new BadRequestError('Lab order not found');
    new SuccessResponse('Lab order status updated successfully', labOrder).send(
      res,
    );
  }),
);

// Submit lab results
router.post(
  '/lab-results',
  validator(schema.submitLabResults),
  asyncHandler(async (req: PublicRequest, res: Response) => {
    const labResult = await LabResultRepo.create(req.body);
    // Update the corresponding lab order status
    await LabOrderRepo.update(new Types.ObjectId(req.body.labOrderId), {
      status: req.body.status,
    });
    new SuccessResponse('Lab results submitted successfully', labResult).send(
      res,
    );
  }),
);

// Retrieve lab results
router.get(
  '/lab-results/:id',
  asyncHandler(async (req: PublicRequest, res: Response) => {
    const labResult = await LabResultRepo.findById(
      new Types.ObjectId(req.params.id),
    );
    if (!labResult) throw new BadRequestError('Lab results not found');
    new SuccessResponse('Lab results retrieved successfully', labResult).send(
      res,
    );
  }),
);

// Get patient's lab history
router.get(
  '/patients/:id/lab-results',
  asyncHandler(async (req: PublicRequest, res: Response) => {
    const { orders } = await LabOrderRepo.findByPatientId(
      new Types.ObjectId(req.params.id),
    );
    new SuccessResponse(
      'Patient lab history retrieved successfully',
      orders,
    ).send(res);
  }),
);

export default router;

import express from 'express';
import { Types } from 'mongoose';
import { ProtectedRequest } from '../../types/app-request';
import validator from '../../helpers/validator';
import schema from './schema';
import asyncHandler from '../../helpers/asyncHandler';
import authentication from '../../auth/authentication';
import EmergencyRequestRepo from '../../database/repository/EmergencyRequestRepo';
import { SuccessResponse } from '../../core/ApiResponse';
import { BadRequestError } from '../../core/ApiError';

const router = express.Router({ mergeParams: true });

/*-------------------------------------------------------------------------*/
router.use(authentication);
/*-------------------------------------------------------------------------*/

// Create emergency request
router.post(
  '/',
  validator(schema.createEmergencyRequest),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const emergencyRequest = await EmergencyRequestRepo.create({
      patient: new Types.ObjectId(req.body.patientId),
      location: req.body.location,
      description: req.body.description,
      priority: req.body.priority,
    });

    new SuccessResponse(
      'Emergency request created successfully',
      emergencyRequest,
    ).send(res);
  }),
);

// Get emergency request status
router.get(
  '/:id',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const emergencyRequest = await EmergencyRequestRepo.findById(
      new Types.ObjectId(req.params.id),
    );

    if (!emergencyRequest) {
      throw new BadRequestError('Emergency request not found');
    }

    new SuccessResponse(
      'Emergency request retrieved successfully',
      emergencyRequest,
    ).send(res);
  }),
);

// Update emergency request status
router.put(
  '/:id/status',
  validator(schema.updateEmergencyRequestStatus),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const emergencyRequest = await EmergencyRequestRepo.update(
      new Types.ObjectId(req.params.id),
      req.body,
    );
    if (!emergencyRequest) {
      throw new BadRequestError('Emergency request not found');
    }
    new SuccessResponse(
      'Emergency request updated successfully',
      emergencyRequest,
    ).send(res);
  }),
);

export default router;

import express from 'express';
import asyncHandler from '../../helpers/asyncHandler';
import { ProtectedRequest } from '../../types/app-request';
import { SuccessResponse } from '../../core/ApiResponse';
import { BadRequestError } from '../../core/ApiError';
import validator, { ValidationSource } from '../../helpers/validator';
import schema from './schema';
import TelemedicineSessionRepo from '../../database/repository/TelemedicineSessionRepo';
import { Types } from 'mongoose';

const router = express.Router({ mergeParams: true });

router.post(
  '/',
  validator(schema.sessionId, ValidationSource.PARAM),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const session = await TelemedicineSessionRepo.findById(
      new Types.ObjectId(req.params.id),
    );

    if (!session) throw new BadRequestError('Telemedicine session not found');

    // TODO: Implement actual recording toggle logic here
    // This could be using a service like Twilio, Agora, etc.
    const isRecording = true; // This should come from the actual implementation

    new SuccessResponse('Recording status updated successfully', {
      isRecording,
    }).send(res);
  }),
);

export default router;

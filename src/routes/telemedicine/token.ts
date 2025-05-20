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

router.get(
  '/',
  validator(schema.sessionId, ValidationSource.PARAM),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const session = await TelemedicineSessionRepo.findById(
      new Types.ObjectId(req.params.id),
    );

    if (!session) throw new BadRequestError('Telemedicine session not found');

    // TODO: Implement actual token generation logic here
    // This could be using a service like Twilio, Agora, etc.
    const token = 'dummy-token-for-now';

    new SuccessResponse('Connection token generated successfully', {
      token,
    }).send(res);
  }),
);

export default router;

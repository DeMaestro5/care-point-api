import express from 'express';
import asyncHandler from '../../helpers/asyncHandler';
import { ProtectedRequest } from '../../types/app-request';
import { SuccessResponse } from '../../core/ApiResponse';
import { BadRequestError } from '../../core/ApiError';
import validator, { ValidationSource } from '../../helpers/validator';
import schema from './schema';
import TelemedicineSessionRepo from '../../database/repository/TelemedicineSessionRepo';
import TelemedicineRecordingService from '../../services/TelemedicineRecordingService';
import { Types } from 'mongoose';

const router = express.Router({ mergeParams: true });

router.post(
  '/',
  validator(schema.sessionId, ValidationSource.PARAM),
  validator(schema.toggleRecording),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const session = await TelemedicineSessionRepo.findById(
      new Types.ObjectId(req.params.id),
    );

    if (!session) throw new BadRequestError('Telemedicine session not found');

    const result = await TelemedicineRecordingService.toggleRecording(
      new Types.ObjectId(req.params.id),
      req.body.isRecording,
    );

    new SuccessResponse('Recording status updated successfully', result).send(
      res,
    );
  }),
);

export default router;

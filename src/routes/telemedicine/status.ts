import express from 'express';
import asyncHandler from '../../helpers/asyncHandler';
import TelemedicineSessionRepo from '../../database/repository/TelemedicineSessionRepo';
import { SuccessResponse } from '../../core/ApiResponse';
import { BadRequestError } from '../../core/ApiError';
import { Types } from 'mongoose';
import { ProtectedRequest } from '../../types/app-request';
import validator from '../../helpers/validator';
import schema from './schema';

const router = express.Router({ mergeParams: true });

router.put(
  '/',
  validator(schema.updateStatus),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const session = await TelemedicineSessionRepo.update(
      new Types.ObjectId(req.params.id),
      { status: req.body.status },
    );

    if (!session) throw new BadRequestError('Telemedicine session not found');
    new SuccessResponse('success', session).send(res);
  }),
);

export default router;

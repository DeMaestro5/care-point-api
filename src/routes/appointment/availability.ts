import express from 'express';
import asyncHandler from '../../helpers/asyncHandler';
import { ProtectedRequest } from '../../types/app-request';
import { Types } from 'mongoose';
import AppointmentRepo from '../../database/repository/AppointmentRepo';
import { SuccessResponse } from '../../core/ApiResponse';

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { doctorId } = req.params;
    const { startDate, endDate } = req.query;

    const availability = await AppointmentRepo.getAvailability(
      new Types.ObjectId(doctorId),
      new Date(startDate as string),
      new Date(endDate as string),
    );

    if (availability.length === 0) {
      return new SuccessResponse('Not available', {}).send(res);
    }

    return new SuccessResponse('Availability retrieved successfully', {
      availability,
    }).send(res);
  }),
);

export default router;

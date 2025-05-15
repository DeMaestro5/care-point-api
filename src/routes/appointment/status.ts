import express from 'express';
import { ProtectedRequest } from '../../types/app-request';
import AppointmentRepo from '../../database/repository/AppointmentRepo';
import { Types } from 'mongoose';
import asyncHandler from '../../helpers/asyncHandler';
import validator from '../../helpers/validator';
import schema from './schema';
import { SuccessResponse } from '../../core/ApiResponse';
import { BadRequestError } from '../../core/ApiError';

const router = express.Router({ mergeParams: true });

router.put(
  '/',
  validator(schema.updateAppointmentStatus),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { appointmentId } = req.params;
    const { status } = req.body;

    const appointment = await AppointmentRepo.update(
      new Types.ObjectId(appointmentId),
      { status },
    );

    if (!appointment) {
      throw new BadRequestError('Appointment not found');
    }

    return new SuccessResponse(
      'Appointment status updated successfully',
      appointment,
    ).send(res);
  }),
);

export default router;

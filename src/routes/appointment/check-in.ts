import express from 'express';
import { ProtectedRequest } from '../../types/app-request';
import asyncHandler from '../../helpers/asyncHandler';
import { BadRequestError } from '../../core/ApiError';
import { Types } from 'mongoose';
import AppointmentRepo from '../../database/repository/AppointmentRepo';
import { SuccessResponse } from '../../core/ApiResponse';

const router = express.Router({ mergeParams: true });

router.post(
  '/',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { appointmentId } = req.params;
    const { checkInTime } = req.body;

    const appointment = await AppointmentRepo.findById(
      new Types.ObjectId(appointmentId),
    );

    if (!appointment) {
      throw new BadRequestError('Appointment not found');
    }

    if (appointment.status !== 'scheduled') {
      throw new BadRequestError('Appointment is not scheduled');
    }

    if (appointment.checkInTime) {
      throw new BadRequestError('Appointment is already checked in');
    }

    appointment.checkInTime = checkInTime;
    await appointment.save();

    return new SuccessResponse('Appointment checked in successfully', {
      appointment,
    }).send(res);
  }),
);

export default router;

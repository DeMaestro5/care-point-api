import express from 'express';
import asyncHandler from '../../helpers/asyncHandler';
import { ProtectedRequest } from '../../types/app-request';
import { Types } from 'mongoose';
import AppointmentRepo from '../../database/repository/AppointmentRepo';
import { BadRequestError } from '../../core/ApiError';
import { SuccessResponse } from '../../core/ApiResponse';

const router = express.Router({ mergeParams: true });

// Get available slots for a specific doctor
router.get(
  '/doctor/:doctorId',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { doctorId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new BadRequestError('Start date and end date are required');
    }

    const slots = await AppointmentRepo.getAvailability(
      new Types.ObjectId(doctorId),
      new Date(startDate as string),
      new Date(endDate as string),
    );

    return new SuccessResponse('Slots retrieved successfully', {
      slots,
    }).send(res);
  }),
);

// Get slots for rescheduling a specific appointment
router.get(
  '/appointment/:appointmentId',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { appointmentId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new BadRequestError('Start date and end date are required');
    }

    const appointment = await AppointmentRepo.findById(
      new Types.ObjectId(appointmentId),
    );

    if (!appointment) {
      throw new BadRequestError('Appointment not found');
    }

    if (appointment.status !== 'scheduled') {
      throw new BadRequestError('Appointment is not scheduled');
    }

    const slots = await AppointmentRepo.getAvailability(
      appointment.doctor,
      new Date(startDate as string),
      new Date(endDate as string),
    );

    return new SuccessResponse('Slots retrieved successfully', {
      slots,
    }).send(res);
  }),
);

export default router;

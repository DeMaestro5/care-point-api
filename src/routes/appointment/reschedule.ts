import express from 'express';
import asyncHandler from '../../helpers/asyncHandler';
import { ProtectedRequest } from '../../types/app-request';
import AppointmentRepo from '../../database/repository/AppointmentRepo';
import { SuccessResponse } from '../../core/ApiResponse';
import { BadRequestError } from '../../core/ApiError';
import validator from '../../helpers/validator';
import schema from './schema';
import { Types } from 'mongoose';

const router = express.Router({ mergeParams: true });

router.post(
  '/',
  validator(schema.rescheduleAppointment),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { appointmentId } = req.params;
    const { appointmentDate, reason, notes } = req.body;

    // First get the existing appointment to preserve doctor information
    const existingAppointment = await AppointmentRepo.findById(
      new Types.ObjectId(appointmentId),
    );

    if (!existingAppointment) {
      throw new BadRequestError('Original appointment not found');
    }

    // Create new appointment with preserved doctor information
    const appointment = await AppointmentRepo.create({
      appointmentDate,
      reason,
      notes,
      status: 'rescheduled',
      doctor: existingAppointment.doctor._id,
      patient: existingAppointment.patient,
    });

    if (!appointment) {
      throw new BadRequestError('Failed to reschedule appointment');
    }

    return new SuccessResponse('Appointment rescheduled successfully', {
      appointment,
    }).send(res);
  }),
);

export default router;

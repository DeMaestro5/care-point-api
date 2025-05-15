import express from 'express';
import { SuccessResponse } from '../../core/ApiResponse';
import { BadRequestError } from '../../core/ApiError';
import asyncHandler from '../../helpers/asyncHandler';
import { ProtectedRequest } from '../../types/app-request';
import AppointmentRepo from '../../database/repository/AppointmentRepo';
import { Types } from 'mongoose';
import validator from '../../helpers/validator';
import schema from './schema';
import authentication from '../../auth/authentication';
import type Appointment from '../../database/model/Appointment';
import statusRouter from './status';
import rescheduleRouter from './reschedule';
import availabilityRouter from './availability';
import checkInRouter from './check-in';
const router = express.Router();

router.use(authentication);

router.use('/:appointmentId/status', statusRouter);
router.use('/:appointmentId/reschedule', rescheduleRouter);
router.use('/availability', availabilityRouter);
router.use('/check-in', checkInRouter);

// Get all appointments with filtering
router.get(
  '/',
  validator(schema.searchAppointments),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;

    // Build filter object
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.appointmentDate = {};
      if (startDate) {
        filter.appointmentDate.$gte = new Date(startDate as string);
      }
      if (endDate) {
        filter.appointmentDate.$lte = new Date(endDate as string);
      }
    }

    // if (doctorId) {
    //   filter.doctor = new Types.ObjectId(doctorId as string);
    // }

    // if (patientId) {
    //   filter.patient = new Types.ObjectId(patientId as string);
    // }

    // If user is a doctor, they can only see their appointments
    if (req.user.role === 'DOCTOR') {
      filter.doctor = new Types.ObjectId(req.user._id);
    }

    console.log('Handler: Finding appointments with filter:', filter);

    const { appointments, total } = await AppointmentRepo.findByFilter(filter, {
      page: Number(page),
      limit: Number(limit),
    });

    console.log('Handler: Found appointments, sending response');

    return new SuccessResponse('Appointments retrieved successfully', {
      appointments,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    }).send(res);
  }),
);

// Create a new appointment
router.post(
  '/',
  validator(schema.createAppointment),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { doctorId, appointmentDate, reason, notes } = req.body;

    // Determine the patient ID based on user role
    if (req.user.role !== 'PATIENT') {
      throw new BadRequestError(
        'Only patients can create appointments through this endpoint',
      );
    }

    const appointmentData: Partial<Appointment> = {
      doctor: doctorId as any,
      patient: req.user._id as any,
      appointmentDate,
      reason,
      notes,
      status: 'scheduled',
    };

    const appointment = await AppointmentRepo.create(appointmentData);

    return new SuccessResponse('Appointment created successfully', {
      appointment,
    }).send(res);
  }),
);

// Update an appointment
router.put(
  '/:appointmentId',
  validator(schema.updateAppointment),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { appointmentId } = req.params;
    const { appointmentDate, reason, notes } = req.body;

    console.log('Handler: Updating appointment:', {
      appointmentId,
      appointmentDate,
      reason,
      notes,
    });

    const appointment = await AppointmentRepo.update(
      new Types.ObjectId(appointmentId),
      { appointmentDate, reason, notes },
    );

    if (!appointment) {
      throw new BadRequestError('Appointment not found or update failed');
    }

    console.log('Handler: Successfully updated appointment:', appointment);

    return new SuccessResponse('Appointment updated successfully', {
      appointment,
    }).send(res);
  }),
);

// Delete an appointment / cancel an appointment
router.delete(
  '/:appointmentId',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { appointmentId } = req.params;

    const appointment = await AppointmentRepo.delete(
      new Types.ObjectId(appointmentId),
    );

    return new SuccessResponse(
      'Appointment deleted / cancelled  successfully',
      {
        appointment,
      },
    ).send(res);
  }),
);

export default router;

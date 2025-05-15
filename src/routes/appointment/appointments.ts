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

const router = express.Router();

/*-------------------------------------------------------------------------*/
// Below all routes require authenticated user
/*-------------------------------------------------------------------------*/
router.use(authentication);

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

    // If user is a patient, they can only see their appointments
    if (req.user.role === 'PATIENT') {
      filter.patient = new Types.ObjectId(req.user._id);
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
    const { doctorId, patientId, appointmentDate, reason, notes } = req.body;

    console.log('Handler: Creating appointment with data:', {
      doctorId,
      patientId,
      appointmentDate,
      reason,
      notes,
    });

    // If user is a doctor, they can create appointments for any patient
    // If user is a patient, they can only create appointments for themselves
    if (req.user.role === 'PATIENT' && patientId !== req.user._id.toString()) {
      throw new BadRequestError(
        'You can only create appointments for yourself',
      );
    }

    const appointmentData = {
      doctor: new Types.ObjectId(doctorId) as any,
      patient: new Types.ObjectId(patientId) as any,
      appointmentDate: new Date(appointmentDate),
      reason,
      notes,
      status: 'scheduled' as const,
    };

    const appointment = await AppointmentRepo.create(appointmentData);

    console.log('Handler: Created appointment, sending response');

    return new SuccessResponse('Appointment created successfully', {
      appointment,
    }).send(res);
  }),
);

export default router;

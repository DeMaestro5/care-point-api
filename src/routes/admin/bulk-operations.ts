import express from 'express';
import { SuccessResponse } from '../../core/ApiResponse';
import { ProtectedRequest } from '../../types/app-request';
import asyncHandler from '../../helpers/asyncHandler';
import authentication from '../../auth/authentication';
import adminAuth from '../../auth/adminAuth';
import validator from '../../helpers/validator';
import schema from './schema';
import AppointmentRepo from '../../database/repository/AppointmentRepo';
import NotificationRepo from '../../database/repository/NotificationRepo';

const router = express.Router();

/*-------------------------------------------------------------------------*/
// Below all routes require authenticated admin user
/*-------------------------------------------------------------------------*/
router.use(authentication);
router.use(adminAuth);

// Bulk create appointments
router.post(
  '/appointments',
  validator(schema.bulkAppointments),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { appointments } = req.body;

    const createdAppointments = await Promise.all(
      appointments.map(async (appointment: any) => {
        return AppointmentRepo.create({
          patient: appointment.patientId,
          doctor: appointment.doctorId,
          appointmentDate: appointment.appointmentDate,
          appointmentType: appointment.appointmentType,
          notes: appointment.notes,
          reason: appointment.reason,
          status: 'scheduled',
        });
      }),
    );

    new SuccessResponse(
      'Appointments created successfully',
      createdAppointments,
    ).send(res);
  }),
);

// Bulk send notifications
router.post(
  '/notifications',
  validator(schema.bulkNotifications),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { recipients } = req.body;

    const sentNotifications = await Promise.all(
      recipients.map(async (recipient: any) => {
        return NotificationRepo.create({
          ...recipient,
          sender: req.user._id,
          status: 'sent',
          createdAt: new Date(),
        });
      }),
    );

    new SuccessResponse(
      'Notifications sent successfully',
      sentNotifications,
    ).send(res);
  }),
);

export default router;

import express from 'express';
import { SuccessResponse } from '../../core/ApiResponse';
import { ProtectedRequest } from '../../types/app-request';
import asyncHandler from '../../helpers/asyncHandler';
import authentication from '../../auth/authentication';
import adminAuth from '../../auth/adminAuth';
import validator from '../../helpers/validator';
import schema from './schema';
import UserRepo from '../../database/repository/UserRepo';
import AppointmentRepo from '../../database/repository/AppointmentRepo';
import PrescriptionRepo from '../../database/repository/PrescriptionRepo';
import DoctorRepo from '../../database/repository/DoctorRepo';
import PatientRepo from '../../database/repository/PatientRepo';

const router = express.Router();

/*-------------------------------------------------------------------------*/
// Below all routes require authenticated admin user
/*-------------------------------------------------------------------------*/
router.use(authentication);
router.use(adminAuth);

// Get system statistics
router.get(
  '/',
  validator(schema.getSystemStats),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { startDate, endDate } = req.query;
    const dateFilter =
      startDate && endDate
        ? {
            createdAt: {
              $gte: new Date(startDate as string),
              $lte: new Date(endDate as string),
            },
          }
        : {};

    const [
      totalUsers,
      totalDoctors,
      totalPatients,
      totalAppointments,
      totalPrescriptions,
      activeAppointments,
      completedAppointments,
      pendingPrescriptions,
    ] = await Promise.all([
      UserRepo.count(dateFilter),
      DoctorRepo.count(dateFilter),
      PatientRepo.count(dateFilter),
      AppointmentRepo.count(dateFilter),
      PrescriptionRepo.count(dateFilter),
      AppointmentRepo.count({ ...dateFilter, status: 'active' }),
      AppointmentRepo.count({ ...dateFilter, status: 'completed' }),
      PrescriptionRepo.count({ ...dateFilter, status: 'pending' }),
    ]);

    new SuccessResponse('System statistics retrieved successfully', {
      users: {
        total: totalUsers,
        doctors: totalDoctors,
        patients: totalPatients,
      },
      appointments: {
        total: totalAppointments,
        active: activeAppointments,
        completed: completedAppointments,
      },
      prescriptions: {
        total: totalPrescriptions,
        pending: pendingPrescriptions,
      },
    }).send(res);
  }),
);

export default router;

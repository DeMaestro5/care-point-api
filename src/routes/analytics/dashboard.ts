import express from 'express';
import validator from '../../helpers/validator';
import { ProtectedRequest } from '../../types/app-request';
import asyncHandler from '../../helpers/asyncHandler';
import schema from './schema';
import AppointmentRepo from '../../database/repository/AppointmentRepo';
import PrescriptionRepo from '../../database/repository/PrescriptionRepo';
import DoctorRepo from '../../database/repository/DoctorRepo';
import PharmacyRepo from '../../database/repository/PharmacyRepo';
import { Types } from 'mongoose';
import { SuccessResponse } from '../../core/ApiResponse';

const router = express.Router({ mergeParams: true });

// Get role-specific dashboard data
router.get(
  '/',
  validator(schema.getDashboardData),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { type } = req.params;
    const { startDate, endDate } = req.query;

    let dashboardData: any = {};

    switch (type) {
      case 'admin':
        // Get overall system metrics
        const appointments = await AppointmentRepo.findByFilter(
          {
            createdAt: {
              $gte: new Date(startDate as string),
              $lte: new Date(endDate as string),
            },
          },
          { page: 1, limit: 1000 },
        );

        const prescriptions = await PrescriptionRepo.find(
          {
            createdAt: {
              $gte: new Date(startDate as string),
              $lte: new Date(endDate as string),
            },
          },
          0,
          1000,
        );

        const doctors = await DoctorRepo.searchDoctors({
          page: 1,
          limit: 1000,
        });

        const allPrescriptions = await PrescriptionRepo.find(
          {
            createdAt: {
              $gte: new Date(startDate as string),
              $lte: new Date(endDate as string),
            },
          },
          0,
          1000,
        );
        const pharmacyIds = new Set(
          allPrescriptions
            .map((p) => p.pharmacy?.toString())
            .filter((id): id is string => id !== undefined),
        );
        const pharmacies = await Promise.all(
          Array.from(pharmacyIds).map(async (id) => {
            return await PharmacyRepo.findById(new Types.ObjectId(id));
          }),
        );

        dashboardData = {
          appointments: {
            total: appointments.total,
            completed: appointments.appointments.filter(
              (apt) => apt.status === 'COMPLETED',
            ).length,
            cancelled: appointments.appointments.filter(
              (apt) => apt.status === 'CANCELLED',
            ).length,
          },
          prescriptions: {
            total: prescriptions.length,
            completed: prescriptions.filter((p) => p.status === 'COMPLETED')
              .length,
          },
          doctors: {
            total: doctors.doctors.length,
            active: doctors.doctors.filter((d) => d.status === true).length,
          },
          pharmacies: {
            total: pharmacies.length,
            active: pharmacies.filter((p: any) => p?.status === true).length,
          },
        };
        break;

      case 'doctor':
        // Get doctor-specific metrics
        if (!req.user._id) throw new Error('Doctor ID not found');

        const doctorAppointments = await AppointmentRepo.findByDoctorId(
          new Types.ObjectId(req.user._id),
        );

        const doctorPrescriptions = await PrescriptionRepo.find(
          {
            doctor: new Types.ObjectId(req.user._id),
            createdAt: {
              $gte: new Date(startDate as string),
              $lte: new Date(endDate as string),
            },
          },
          0,
          1000,
        );

        dashboardData = {
          appointments: {
            total: doctorAppointments.length,
            upcoming: doctorAppointments.filter(
              (apt) =>
                new Date(apt.appointmentDate) > new Date() &&
                apt.status === 'scheduled',
            ).length,
            completed: doctorAppointments.filter(
              (apt) => apt.status === 'completed',
            ).length,
          },
          prescriptions: {
            total: doctorPrescriptions.length,
            recent: doctorPrescriptions.slice(0, 5),
          },
        };
        break;

      case 'pharmacy':
        // Get pharmacy-specific metrics
        if (!req.user._id) throw new Error('Pharmacy ID not found');

        const pharmacyPrescriptions = (await PrescriptionRepo.find(
          {
            pharmacy: new Types.ObjectId(req.user._id),
            createdAt: {
              $gte: new Date(startDate as string),
              $lte: new Date(endDate as string),
            },
          },
          0,
          1000,
        )) as Prescription[];

        interface Prescription {
          status: string;
          pharmacy?: string;
          [key: string]: any;
        }

        dashboardData = {
          prescriptions: {
            total: pharmacyPrescriptions.length,
            pending: pharmacyPrescriptions.filter(
              (p: Prescription) => p.status === 'ACTIVE',
            ).length,
            completed: pharmacyPrescriptions.filter(
              (p: Prescription) => p.status === 'COMPLETED',
            ).length,
          },
          recent: pharmacyPrescriptions.slice(0, 5),
        };
        break;

      case 'patient':
        // Get patient-specific metrics
        if (!req.user._id) throw new Error('Patient ID not found');

        const patientAppointments = await AppointmentRepo.findByPatientId(
          new Types.ObjectId(req.user._id),
        );

        const patientPrescriptions = await PrescriptionRepo.find(
          {
            patient: new Types.ObjectId(req.user._id),
            createdAt: {
              $gte: new Date(startDate as string),
              $lte: new Date(endDate as string),
            },
          },
          0,
          1000,
        );

        dashboardData = {
          appointments: {
            total: patientAppointments.length,
            upcoming: patientAppointments.filter(
              (apt) =>
                new Date(apt.appointmentDate) > new Date() &&
                apt.status === 'scheduled',
            ).length,
            history: patientAppointments.slice(0, 5),
          },
          prescriptions: {
            total: patientPrescriptions.length,
            recent: patientPrescriptions.slice(0, 5),
          },
        };
        break;
    }

    new SuccessResponse('Dashboard data retrieved successfully', {
      period: {
        startDate,
        endDate,
      },
      type,
      data: dashboardData,
    }).send(res);
  }),
);

export default router;

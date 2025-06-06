import express from 'express';
import { SuccessResponse } from '../../core/ApiResponse';
import { ProtectedRequest } from 'app-request';
import asyncHandler from '../../helpers/asyncHandler';
import authentication from '../../auth/authentication';
import validator from '../../helpers/validator';
import schema from './schema';
import DoctorRepo from '../../database/repository/DoctorRepo';
import PharmacyRepo from '../../database/repository/PharmacyRepo';
import AppointmentRepo from '../../database/repository/AppointmentRepo';
import PrescriptionRepo from '../../database/repository/PrescriptionRepo';
import { Types } from 'mongoose';
import revenueRoutes from './revenue';
import trendsRoutes from './trends';
import generateReportsRoutes from './generateReports';
import dashboardRoutes from './dashboard';

const router = express.Router();

/*-------------------------------------------------------------------------*/
// Below all routes require authenticated user
/*-------------------------------------------------------------------------*/
router.use(authentication);

router.use('/revenue', revenueRoutes);
router.use('/trends', trendsRoutes);
router.use('/generate-reports', generateReportsRoutes);
router.use('/dashboards/:type', dashboardRoutes);
// Get patient analytics
router.get(
  '/patients',
  validator(schema.getPatientAnalytics),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { startDate, endDate } = req.query;

    // Get appointments in period
    const appointments = await AppointmentRepo.findByFilter(
      {
        createdAt: {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string),
        },
      },
      { page: 1, limit: 1000 },
    );

    // Get prescriptions in period
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

    new SuccessResponse('Patient analytics retrieved successfully', {
      period: {
        startDate,
        endDate,
      },
      appointments: {
        total: appointments.total,
      },
      prescriptions: {
        total: prescriptions.length,
      },
    }).send(res);
  }),
);

// Get doctor performance analytics
router.get(
  '/doctors',
  validator(schema.getDoctorAnalytics),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { startDate, endDate } = req.query;

    // Get appointments in period
    const appointments = await AppointmentRepo.findByFilter(
      {
        createdAt: {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string),
        },
      },
      { page: 1, limit: 1000 },
    );

    // Get prescriptions in period
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

    // Get all doctors
    const doctors = await DoctorRepo.searchDoctors({
      page: 1,
      limit: 1000,
    });

    // Calculate doctor performance metrics
    const doctorPerformance = doctors.doctors.map((doctor) => {
      const doctorAppointments = appointments.appointments.filter(
        (apt) => apt.doctor.toString() === doctor._id.toString(),
      );

      const doctorPrescriptions = prescriptions.filter(
        (presc) => presc.doctor.toString() === doctor._id.toString(),
      );
      console.log(doctor);

      return {
        doctorId: doctor._id,
        name: doctor.user || 'Unknown',
        appointments: doctorAppointments.length,
        prescriptions: doctorPrescriptions.length,
        averageRating: (doctor as any).rating || 0,
      };
    });

    new SuccessResponse('Doctor performance analytics retrieved successfully', {
      period: {
        startDate,
        endDate,
      },
      totalDoctors: doctors.doctors.length,
      doctorPerformance,
    }).send(res);
  }),
);

// Get pharmacy analytics
router.get(
  '/pharmacies',
  validator(schema.getPharmacyAnalytics),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { startDate, endDate } = req.query;

    // Get prescriptions in period
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

    // Get all pharmacies with prescriptions
    const pharmacies = await PrescriptionRepo.find(
      {
        pharmacy: { $exists: true },
        createdAt: {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string),
        },
      },
      0,
      1000,
    );

    // Get unique pharmacies from prescriptions
    const uniquePharmacyIds = new Set(
      pharmacies
        .map((presc) => presc.pharmacy?.toString())
        .filter((id): id is string => id !== undefined),
    );

    // Calculate pharmacy metrics
    const pharmacyMetrics = await Promise.all(
      Array.from(uniquePharmacyIds).map(async (pharmacyId) => {
        const pharmacy = await PharmacyRepo.findById(
          new Types.ObjectId(pharmacyId),
        );
        if (!pharmacy) return null;

        const pharmacyPrescriptions = prescriptions.filter(
          (presc) => presc.pharmacy?.toString() === pharmacyId,
        );

        return {
          pharmacyId: pharmacy._id,
          name: pharmacy.user || 'Unknown',
          prescriptions: pharmacyPrescriptions.length,
          averageRating: (pharmacy as any).rating || 0,
        };
      }),
    );

    new SuccessResponse('Pharmacy analytics retrieved successfully', {
      period: {
        startDate,
        endDate,
      },
      totalPharmacies: uniquePharmacyIds.size,
      pharmacyMetrics: pharmacyMetrics.filter(
        (metric): metric is NonNullable<typeof metric> => metric !== null,
      ),
    }).send(res);
  }),
);

// Get appointment analytics
router.get(
  '/appointments',
  validator(schema.getAppointmentAnalytics),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { startDate, endDate, groupBy } = req.query;

    // Get appointments in period
    const appointments = await AppointmentRepo.findByFilter(
      {
        createdAt: {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string),
        },
      },
      { page: 1, limit: 1000 },
    );

    // Group appointments by time period
    const groupedAppointments = appointments.appointments.reduce(
      (acc: any, apt) => {
        const date = new Date(apt.appointmentDate);
        let key: string;

        switch (groupBy) {
          case 'week':
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            key = weekStart.toISOString().split('T')[0];
            break;
          case 'month':
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
              2,
              '0',
            )}`;
            break;
          default: // day
            key = date.toISOString().split('T')[0];
        }

        if (!acc[key]) {
          acc[key] = {
            total: 0,
            completed: 0,
            cancelled: 0,
            rescheduled: 0,
          };
        }

        acc[key].total++;
        acc[key][apt.status.toLowerCase()]++;

        return acc;
      },
      {},
    );

    new SuccessResponse('Appointment analytics retrieved successfully', {
      period: {
        startDate,
        endDate,
        groupBy,
      },
      appointments: groupedAppointments,
      summary: {
        total: appointments.total,
        completed: appointments.appointments.filter(
          (apt) => apt.status === 'completed',
        ).length,
        cancelled: appointments.appointments.filter(
          (apt) => apt.status === 'cancelled',
        ).length,
        rescheduled: appointments.appointments.filter(
          (apt) => apt.status === 'rescheduled',
        ).length,
      },
    }).send(res);
  }),
);

export default router;

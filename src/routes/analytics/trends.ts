import express from 'express';
import validator from '../../helpers/validator';
import asyncHandler from '../../helpers/asyncHandler';
import { ProtectedRequest } from '../../types/app-request';
import AppointmentRepo from '../../database/repository/AppointmentRepo';
import PrescriptionRepo from '../../database/repository/PrescriptionRepo';
import schema from './schema';
import DoctorRepo from '../../database/repository/DoctorRepo';
import { BadRequestResponse, SuccessResponse } from '../../core/ApiResponse';

const router = express.Router({ mergeParams: true });

// Get healthcare trends
router.get(
  '/',
  validator(schema.getHealthcareTrends),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { startDate, endDate, type } = req.query;

    if (!startDate || !endDate || !type) {
      return new BadRequestResponse('Invalid request parameters').send(res);
    }

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

    let trends: any = {};

    switch (type) {
      case 'conditions':
        // Analyze common conditions from appointments
        trends = appointments.appointments.reduce((acc: any, apt) => {
          const condition = apt.reason.toLowerCase();
          acc[condition] = (acc[condition] || 0) + 1;
          return acc;
        }, {});
        break;

      case 'medications':
        // Analyze common medications from prescriptions
        trends = prescriptions.reduce((acc: any, presc) => {
          presc.medications.forEach((med: any) => {
            const medication = med.name.toLowerCase();
            acc[medication] = (acc[medication] || 0) + 1;
          });
          return acc;
        }, {});
        break;

      case 'specialties':
        // Get all doctors and their specialties
        const doctors = await DoctorRepo.searchDoctors({
          page: 1,
          limit: 1000,
        });

        // Count appointments by specialty
        trends = appointments.appointments.reduce((acc: any, apt) => {
          const doctor = doctors.doctors.find(
            (d) => d._id.toString() === apt.doctor.toString(),
          );
          if (doctor && doctor.specialization) {
            const specialty = doctor.specialization.toLowerCase();
            acc[specialty] = (acc[specialty] || 0) + 1;
          }
          return acc;
        }, {});
        break;
    }

    // Sort trends by frequency
    const sortedTrends = Object.entries(trends)
      .sort(([, a]: any, [, b]: any) => b - a)
      .reduce((acc: any, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

    new SuccessResponse('Healthcare trends retrieved successfully', {
      period: {
        startDate,
        endDate,
      },
      type,
      trends: sortedTrends,
    }).send(res);
  }),
);

export default router;

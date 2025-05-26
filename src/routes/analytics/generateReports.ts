import express from 'express';
import { ProtectedRequest } from '../../types/app-request';
import validator from '../../helpers/validator';
import asyncHandler from '../../helpers/asyncHandler';
import schema from './schema';
import AppointmentRepo from '../../database/repository/AppointmentRepo';
import PrescriptionRepo from '../../database/repository/PrescriptionRepo';
import DoctorRepo from '../../database/repository/DoctorRepo';
import PharmacyRepo from '../../database/repository/PharmacyRepo';
import { Types } from 'mongoose';
import { BadRequestResponse, SuccessResponse } from '../../core/ApiResponse';

const router = express.Router({ mergeParams: true });

// Generate custom reports
router.get(
  '/',
  validator(schema.generateReport),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { startDate, endDate, type, format } = req.query;

    if (!startDate || !endDate || !type || !format) {
      return new BadRequestResponse('Invalid request parameters').send(res);
    }

    // Get data based on report type
    let reportData: any = {};

    switch (type) {
      case 'appointments':
        const appointments = await AppointmentRepo.findByFilter(
          {
            createdAt: {
              $gte: new Date(startDate as string),
              $lte: new Date(endDate as string),
            },
          },
          { page: 1, limit: 1000 },
        );
        reportData = appointments;
        break;

      case 'revenue':
        const revenuePrescriptions = await PrescriptionRepo.find(
          {
            createdAt: {
              $gte: new Date(startDate as string),
              $lte: new Date(endDate as string),
            },
            status: 'COMPLETED',
          },
          0,
          1000,
        );
        reportData = revenuePrescriptions;
        break;

      case 'patients':
        // Implement patient report data collection
        break;

      case 'doctors':
        const doctorResult = await DoctorRepo.searchDoctors({
          page: 1,
          limit: 1000,
        });
        reportData = doctorResult;
        break;

      case 'pharmacies':
        const pharmacyPrescriptions = await PrescriptionRepo.find(
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
          pharmacyPrescriptions
            .map((p) => p.pharmacy?.toString())
            .filter((id): id is string => id !== undefined),
        );
        const pharmacies = await Promise.all(
          Array.from(pharmacyIds).map(async (id) => {
            return await PharmacyRepo.findById(new Types.ObjectId(id));
          }),
        );
        reportData = {
          pharmacies: pharmacies.filter(
            (p): p is NonNullable<typeof p> => p !== null,
          ),
        };
        break;
    }

    // TODO: Implement report generation based on format (PDF, CSV, Excel)
    // For now, just return the data
    new SuccessResponse('Report generated successfully', {
      period: {
        startDate,
        endDate,
      },
      type,
      format,
      data: reportData,
    }).send(res);
  }),
);

export default router;

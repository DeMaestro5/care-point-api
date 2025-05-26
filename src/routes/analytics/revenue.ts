import express from 'express';
import validator from '../../helpers/validator';
import { ProtectedRequest } from '../../types/app-request';
import asyncHandler from '../../helpers/asyncHandler';
import schema from './schema';
import AppointmentRepo from '../../database/repository/AppointmentRepo';
import PrescriptionRepo from '../../database/repository/PrescriptionRepo';
import { BadRequestResponse, SuccessResponse } from '../../core/ApiResponse';

const router = express.Router({ mergeParams: true });

// Get revenue analytics
router.get(
  '/',
  validator(schema.getRevenueAnalytics),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { startDate, endDate, groupBy, type } = req.query;

    if (!startDate || !endDate || !type || !groupBy) {
      return new BadRequestResponse('Invalid request parameters').send(res);
    }

    // Get appointments and prescriptions in period
    const appointments = await AppointmentRepo.findByFilter(
      {
        createdAt: {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string),
        },
        status: 'completed',
      },
      { page: 1, limit: 1000 },
    );

    const prescriptions = await PrescriptionRepo.find(
      {
        createdAt: {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string),
        },
        status: 'completed',
      },
      0,
      1000,
    );

    // Calculate revenue by time period
    const calculateRevenue = (items: any[], dateField: string) => {
      return items.reduce((acc: any, item) => {
        const date = new Date(item[dateField]);
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
          acc[key] = 0;
        }

        acc[key] += item.amount || 0;
        return acc;
      }, {});
    };

    const appointmentRevenue =
      type !== 'prescriptions'
        ? calculateRevenue(appointments.appointments, 'appointmentDate')
        : {};
    const prescriptionRevenue =
      type !== 'appointments'
        ? calculateRevenue(prescriptions, 'createdAt')
        : {};

    // Combine revenues if type is 'all'
    const totalRevenue =
      type === 'all'
        ? Object.keys({ ...appointmentRevenue, ...prescriptionRevenue }).reduce(
            (acc: any, key) => {
              acc[key] =
                (appointmentRevenue[key] || 0) +
                (prescriptionRevenue[key] || 0);
              return acc;
            },
            {},
          )
        : type === 'appointments'
          ? appointmentRevenue
          : prescriptionRevenue;

    new SuccessResponse('Revenue analytics retrieved successfully', {
      period: {
        startDate,
        endDate,
        groupBy,
        type,
      },
      revenue: totalRevenue,
      summary: {
        totalAppointmentRevenue: Object.values(appointmentRevenue).reduce(
          (a: number, b: number) => a + b,
          0,
        ),
        totalPrescriptionRevenue: Object.values(prescriptionRevenue).reduce(
          (a: number, b: number) => a + b,
          0,
        ),
        totalRevenue: Object.values(totalRevenue).reduce(
          (a: number, b: number) => a + b,
          0,
        ),
      },
    }).send(res);
  }),
);

export default router;

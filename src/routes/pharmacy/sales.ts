import express from 'express';
import schema from './schema';
import validator from '../../helpers/validator';
import asyncHandler from '../../helpers/asyncHandler';
import { ProtectedRequest } from '../../types/app-request';
import { Types } from 'mongoose';
import pharmacyAuth from '../../auth/pharmacyAuth';
import OrderRepo from '../../database/repository/OrderRepo';
import { SuccessResponse } from '../../core/ApiResponse';
import checkPharmacyOwnership from '../../auth/checkPharmacyUtil';

const router = express.Router({ mergeParams: true });

// Get sales reports
router.get(
  '/',
  validator(schema.getSalesReport),
  pharmacyAuth,
  checkPharmacyOwnership,
  asyncHandler(async (req: ProtectedRequest, res) => {
    const pharmacyId = new Types.ObjectId(req.pharmacy?._id);
    const { startDate, endDate, groupBy = 'day' } = req.query;

    // Get orders for the period
    const orders = await OrderRepo.findByPharmacyId(
      pharmacyId,
      1,
      1000, // Get all orders for the period
      {
        status: 'COMPLETED',
        createdAt: {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string),
        },
      },
    );

    // Group sales by the specified period
    const salesByPeriod = new Map();
    orders.orders.forEach((order) => {
      const date = new Date(order.createdAt);
      let key: string;

      switch (groupBy) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
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
        default:
          key = date.toISOString().split('T')[0];
      }

      const current = salesByPeriod.get(key) || { orders: 0, revenue: 0 };
      salesByPeriod.set(key, {
        orders: current.orders + 1,
        revenue: current.revenue + order.totalAmount,
      });
    });

    // Convert to array and sort by date
    const salesReport = Array.from(salesByPeriod.entries())
      .map(([period, data]) => ({
        period,
        ...data,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));

    new SuccessResponse('success', {
      period: {
        startDate,
        endDate,
        groupBy,
      },
      sales: salesReport,
    }).send(res);
  }),
);

export default router;

import express from 'express';
import { Types } from 'mongoose';
import asyncHandler from '../../helpers/asyncHandler';
import { ProtectedRequest } from 'app-request';
import { SuccessResponse } from '../../core/ApiResponse';
import OrderRepo from '../../database/repository/OrderRepo';
import InventoryRepo from '../../database/repository/InventoryRepo';
import validator from '../../helpers/validator';
import schema from './schema';
import pharmacyAuth from '../../auth/pharmacyAuth';
import { Inventory } from '../../database/model/Inventory';
import checkPharmacyOwnership from '../../auth/checkPharmacyUtil';

const router = express.Router({ mergeParams: true });

// Get pharmacy analytics
router.get(
  '/',
  validator(schema.getPharmacyAnalytics),
  pharmacyAuth,
  checkPharmacyOwnership,
  asyncHandler(async (req: ProtectedRequest, res) => {
    const pharmacyId = new Types.ObjectId(req.pharmacy?._id);
    const { startDate, endDate } = req.query;

    // Get total orders and revenue
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

    // Calculate analytics
    const totalOrders = orders.orders.length;
    const totalRevenue = orders.orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get inventory analytics
    const { items: inventory } =
      await InventoryRepo.findByPharmacyId(pharmacyId);
    const totalInventoryItems = inventory.length;
    const lowStockItems = inventory.filter(
      (item: Inventory) => item.quantity < 10,
    ).length;

    new SuccessResponse('success', {
      period: {
        startDate,
        endDate,
      },
      orders: {
        total: totalOrders,
        revenue: totalRevenue,
        averageOrderValue,
      },
      inventory: {
        totalItems: totalInventoryItems,
        lowStockItems,
      },
    }).send(res);
  }),
);

export default router;

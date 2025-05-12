import express from 'express';
import { Types } from 'mongoose';
import asyncHandler from '../../helpers/asyncHandler';
import { ProtectedRequest } from 'app-request';
import { BadRequestError, ForbiddenError } from '../../core/ApiError';
import { SuccessResponse } from '../../core/ApiResponse';
import OrderRepo from '../../database/repository/OrderRepo';
import PharmacyRepo from '../../database/repository/PharmacyRepo';
import validator from '../../helpers/validator';
import schema from './schema';
import pharmacyAuth from '../../auth/pharmacyAuth';

const router = express.Router({ mergeParams: true });

// Middleware to check pharmacy ownership
const checkPharmacyOwnership = asyncHandler(
  async (req: ProtectedRequest, res, next) => {
    const pharmacyId = new Types.ObjectId(req.params.pharmacyId);

    // Try to find pharmacy by ID first
    let pharmacy = await PharmacyRepo.findById(pharmacyId);

    // If not found by ID, try to find by user ID
    if (!pharmacy) {
      pharmacy = await PharmacyRepo.findByUserId(pharmacyId);
    }

    if (!pharmacy) {
      throw new BadRequestError('Pharmacy not found');
    }

    // Check if the logged-in user owns this pharmacy
    if (pharmacy.user._id.toString() !== req.user._id.toString()) {
      throw new ForbiddenError(
        'You do not have permission to access this pharmacy',
      );
    }

    // Attach pharmacy to request for later use
    req.pharmacy = pharmacy;
    next();
  },
);

// Create a new order
router.post(
  '/',
  validator(schema.createOrder),
  pharmacyAuth,
  checkPharmacyOwnership,
  asyncHandler(async (req: ProtectedRequest, res) => {
    const pharmacyId = new Types.ObjectId(req.pharmacy?._id); // Use the pharmacy ID from the attached pharmacy object
    const { items, notes } = req.body;

    // Calculate total amount
    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0,
    );

    const order = await OrderRepo.create({
      pharmacy: pharmacyId,
      items,
      totalAmount,
      notes,
      status: 'PENDING',
    });

    new SuccessResponse('Order created successfully', order).send(res);
  }),
);

// List orders for a pharmacy
router.get(
  '/',
  validator(schema.listOrders),
  pharmacyAuth,
  checkPharmacyOwnership,
  asyncHandler(async (req: ProtectedRequest, res) => {
    const pharmacyId = new Types.ObjectId(req.pharmacy?._id); // Use the pharmacy ID from the attached pharmacy object
    const { page = 1, limit = 10, status } = req.query;

    // Get orders with pagination
    const { orders, total } = await OrderRepo.findByPharmacyId(
      pharmacyId,
      Number(page),
      Number(limit),
      status ? { status } : undefined,
    );

    new SuccessResponse('success', {
      orders,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    }).send(res);
  }),
);

export default router;

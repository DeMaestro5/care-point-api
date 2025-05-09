import validator from '../../helpers/validator';

import express from 'express';
import schema from './schema';
import { Types } from 'mongoose';
import asyncHandler from '../../helpers/asyncHandler';
import { BadRequestError } from '../../core/ApiError';
import InventoryRepo from '../../database/repository/InventoryRepo';
import { SuccessResponse } from '../../core/ApiResponse';
import { ProtectedRequest } from 'app-request';
import PharmacyRepo from '../../database/repository/PharmacyRepo';

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  validator(schema.listInventory),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { page = 1, limit = 10 } = req.query;
    const pharmacyId = new Types.ObjectId(req.params.pharmacyId);

    // Verify pharmacy exists
    const pharmacy = await PharmacyRepo.findById(pharmacyId);
    if (!pharmacy) throw new BadRequestError('Pharmacy not found');

    const { items, total } = await InventoryRepo.findByPharmacyId(
      pharmacyId,
      Number(page),
      Number(limit),
    );
    if (!items) throw new BadRequestError('No inventory items found');

    new SuccessResponse('success', {
      items,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    }).send(res);
  }),
);

router.post(
  '/',
  validator(schema.createInventory),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const pharmacyId = new Types.ObjectId(req.params.pharmacyId);

    // Verify pharmacy exists
    const pharmacy = await PharmacyRepo.findById(pharmacyId);
    if (!pharmacy) throw new BadRequestError('Pharmacy not found');

    const inventory = await InventoryRepo.create({
      ...req.body,
      pharmacy: pharmacyId,
    });

    new SuccessResponse('Inventory item added successfully', inventory).send(
      res,
    );
  }),
);

export default router;

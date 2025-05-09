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

router.put(
  '/:itemId',
  validator(schema.updateInventory),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const pharmacyId = new Types.ObjectId(req.params.pharmacyId);
    const itemId = new Types.ObjectId(req.params.itemId);

    // Verify pharmacy exists
    const pharmacy = await PharmacyRepo.findById(pharmacyId);
    if (!pharmacy) throw new BadRequestError('Pharmacy not found');

    // Verify inventory item exists and belongs to pharmacy
    const inventory = await InventoryRepo.findById(itemId);
    if (!inventory) throw new BadRequestError('Inventory item not found');
    if (!inventory.pharmacy.equals(pharmacyId)) {
      throw new BadRequestError(
        'Inventory item does not belong to this pharmacy',
      );
    }

    const updatedInventory = await InventoryRepo.update({
      ...inventory,
      ...req.body,
      _id: itemId,
    });

    new SuccessResponse(
      'Inventory item updated successfully',
      updatedInventory,
    ).send(res);
  }),
);

router.delete(
  '/:itemId',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const pharmacyId = new Types.ObjectId(req.params.pharmacyId);
    const itemId = new Types.ObjectId(req.params.itemId);

    // Verify pharmacy exists
    const pharmacy = await PharmacyRepo.findById(pharmacyId);
    if (!pharmacy) throw new BadRequestError('Pharmacy not found');

    // Verify inventory item exists and belongs to pharmacy
    const inventory = await InventoryRepo.findById(itemId);
    if (!inventory) throw new BadRequestError('Inventory item not found');
    if (!inventory.pharmacy.equals(pharmacyId)) {
      throw new BadRequestError(
        'Inventory item does not belong to this pharmacy',
      );
    }

    await InventoryRepo.delete(itemId);

    new SuccessResponse('Inventory item deleted successfully', {}).send(res);
  }),
);

export default router;

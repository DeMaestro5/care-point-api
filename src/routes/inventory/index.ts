import express from 'express';
import { SuccessResponse } from '../../core/ApiResponse';
import { ProtectedRequest } from 'app-request';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../../core/ApiError';
import validator from '../../helpers/validator';
import schema from './schema';
import asyncHandler from '../../helpers/asyncHandler';
import authentication from '../../auth/authentication';
import { Types } from 'mongoose';
import InventoryRepo from '../../database/repository/InventoryRepo';
import InventoryTransferRepo from '../../database/repository/InventoryTransferRepo';
import StockTakeRepo from '../../database/repository/StockTakeRepo';
import PharmacyRepo from '../../database/repository/PharmacyRepo';
import MedicationRepo from '../../database/repository/MedicationRepo';
import User from '../../database/model/User';

const router = express.Router();

/*-------------------------------------------------------------------------*/
// Below all routes require authenticated user
/*-------------------------------------------------------------------------*/
router.use(authentication);

// INVENTORY TRANSFER ROUTES

// POST /api/inventory/transfers - Transfer inventory between locations
router.post(
  '/transfers',
  validator(schema.createTransfer),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const {
      fromLocation,
      toLocation,
      medication,
      quantity,
      unit,
      batchNumber,
      expiryDate,
      transferType,
      reason,
      notes,
      estimatedDelivery,
    } = req.body;

    // Validate that fromLocation and toLocation are different
    if (fromLocation === toLocation) {
      throw new BadRequestError(
        'Source and destination locations cannot be the same',
      );
    }

    // Validate locations exist
    const [fromPharmacy, toPharmacy] = await Promise.all([
      PharmacyRepo.findById(new Types.ObjectId(fromLocation)),
      PharmacyRepo.findById(new Types.ObjectId(toLocation)),
    ]);

    if (!fromPharmacy) {
      throw new NotFoundError('Source location not found');
    }
    if (!toPharmacy) {
      throw new NotFoundError('Destination location not found');
    }

    // Validate medication exists
    const medicationDoc = await MedicationRepo.findById(
      new Types.ObjectId(medication),
    );
    if (!medicationDoc) {
      throw new NotFoundError('Medication not found');
    }

    // Check if user has permission to transfer from source location
    const user = req.user as User;
    if (
      user.role !== 'ADMIN' &&
      user.role !== 'STAFF' &&
      fromPharmacy.user._id.toString() !== req.user._id.toString()
    ) {
      throw new ForbiddenError(
        'You do not have permission to transfer from this location',
      );
    }

    // Check inventory availability at source location
    const sourceInventory = await InventoryRepo.findByMedicationId(
      new Types.ObjectId(medication),
    );

    const sourceStock = sourceInventory.find(
      (inv) => inv.pharmacy._id.toString() === fromLocation,
    );

    if (!sourceStock || sourceStock.quantity < quantity) {
      throw new BadRequestError('Insufficient inventory at source location');
    }

    const transfer = await InventoryTransferRepo.create({
      fromLocation: new Types.ObjectId(fromLocation),
      toLocation: new Types.ObjectId(toLocation),
      medication: new Types.ObjectId(medication),
      quantity,
      unit,
      batchNumber,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      transferType,
      reason,
      notes,
      requestedBy: req.user._id,
      estimatedDelivery: estimatedDelivery
        ? new Date(estimatedDelivery)
        : undefined,
    });

    new SuccessResponse('Transfer request created successfully', transfer).send(
      res,
    );
  }),
);

// GET /api/inventory/transfers - List transfers
router.get(
  '/transfers',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { pharmacy, status, page = 1, limit = 20 } = req.query;

    let transfers: any[];
    if (pharmacy) {
      transfers = await InventoryTransferRepo.findByPharmacy(
        new Types.ObjectId(pharmacy as string),
        Number(page),
        Number(limit),
      );
    } else if (status) {
      transfers = await InventoryTransferRepo.findByStatus(
        status as string,
        Number(page),
        Number(limit),
      );
    } else {
      // For non-admin users, only show transfers related to their pharmacies
      const user = req.user as User;
      if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
        // Find user's pharmacy
        const userPharmacy = await PharmacyRepo.findByUserId(req.user._id);
        if (!userPharmacy) {
          transfers = [];
        } else {
          // Get transfers for user's pharmacy
          transfers = await InventoryTransferRepo.findByPharmacy(
            userPharmacy._id,
            Number(page),
            Number(limit),
          );
        }
      } else {
        // Admin can see all transfers
        transfers = await InventoryTransferRepo.findByStatus(
          'PENDING',
          Number(page),
          Number(limit),
        );
      }
    }

    new SuccessResponse('Transfers retrieved successfully', {
      transfers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        hasMore: transfers.length === Number(limit),
      },
    }).send(res);
  }),
);

// GET /api/inventory/transfers/{id} - Get transfer details
router.get(
  '/transfers/:id',
  asyncHandler(async (req: ProtectedRequest, res) => {
    if (!Types.ObjectId.isValid(req.params.id)) {
      throw new BadRequestError('Invalid transfer ID format');
    }

    const transfer = await InventoryTransferRepo.findById(
      new Types.ObjectId(req.params.id),
    );

    if (!transfer) {
      throw new NotFoundError('Transfer not found');
    }

    // Check permissions
    const user = req.user as User;
    const isAuthorized =
      user.role === 'ADMIN' ||
      user.role === 'STAFF' ||
      transfer.requestedBy._id.toString() === req.user._id.toString();

    if (!isAuthorized) {
      throw new ForbiddenError('Not authorized to view this transfer');
    }

    new SuccessResponse('Transfer retrieved successfully', transfer).send(res);
  }),
);

// PUT /api/inventory/transfers/{id}/approve - Approve transfer
router.put(
  '/transfers/:id/approve',
  validator(schema.approveTransfer),
  asyncHandler(async (req: ProtectedRequest, res) => {
    if (!Types.ObjectId.isValid(req.params.id)) {
      throw new BadRequestError('Invalid transfer ID format');
    }

    const user = req.user as User;
    if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
      throw new ForbiddenError(
        'Only administrators and staff can approve transfers',
      );
    }

    const { estimatedDelivery, notes } = req.body;

    const transfer = await InventoryTransferRepo.approve(
      new Types.ObjectId(req.params.id),
      req.user._id,
      estimatedDelivery ? new Date(estimatedDelivery) : undefined,
      notes,
    );

    if (!transfer) {
      throw new NotFoundError('Transfer not found');
    }

    new SuccessResponse('Transfer approved successfully', transfer).send(res);
  }),
);

// PUT /api/inventory/transfers/{id}/complete - Complete transfer
router.put(
  '/transfers/:id/complete',
  validator(schema.completeTransfer),
  asyncHandler(async (req: ProtectedRequest, res) => {
    if (!Types.ObjectId.isValid(req.params.id)) {
      throw new BadRequestError('Invalid transfer ID format');
    }

    const { actualCost, notes } = req.body;

    const transfer = await InventoryTransferRepo.complete(
      new Types.ObjectId(req.params.id),
      req.user._id,
      actualCost,
      notes,
    );

    if (!transfer) {
      throw new NotFoundError('Transfer not found');
    }

    // Update inventory quantities
    if (transfer.status === 'COMPLETED') {
      // Reduce quantity from source location
      const sourceInventory = await InventoryRepo.findByMedicationId(
        transfer.medication._id,
      );
      const sourceStock = sourceInventory.find(
        (inv) =>
          inv.pharmacy._id.toString() === transfer.fromLocation._id.toString(),
      );

      if (sourceStock && sourceStock.quantity >= transfer.quantity) {
        await InventoryRepo.update({
          ...sourceStock,
          quantity: sourceStock.quantity - transfer.quantity,
        });
      }

      // Add quantity to destination location
      const destInventory = sourceInventory.find(
        (inv) =>
          inv.pharmacy._id.toString() === transfer.toLocation._id.toString(),
      );

      if (destInventory) {
        await InventoryRepo.update({
          ...destInventory,
          quantity: destInventory.quantity + transfer.quantity,
        });
      } else {
        // Create new inventory entry at destination
        await InventoryRepo.create({
          pharmacy: transfer.toLocation._id,
          medication: transfer.medication._id,
          quantity: transfer.quantity,
          unit: transfer.unit,
          price: sourceStock?.price || 0,
          expiryDate: transfer.expiryDate,
          batchNumber: transfer.batchNumber,
          status: true,
        });
      }
    }

    new SuccessResponse('Transfer completed successfully', transfer).send(res);
  }),
);

// PUT /api/inventory/transfers/{id}/cancel - Cancel transfer
router.put(
  '/transfers/:id/cancel',
  validator(schema.cancelTransfer),
  asyncHandler(async (req: ProtectedRequest, res) => {
    if (!Types.ObjectId.isValid(req.params.id)) {
      throw new BadRequestError('Invalid transfer ID format');
    }

    const { reason } = req.body;

    const transfer = await InventoryTransferRepo.cancel(
      new Types.ObjectId(req.params.id),
      reason,
    );

    if (!transfer) {
      throw new NotFoundError('Transfer not found');
    }

    new SuccessResponse('Transfer cancelled successfully', transfer).send(res);
  }),
);

// STOCK TAKE ROUTES

// POST /api/inventory/stocktake - Record inventory count
router.post(
  '/stocktake',
  validator(schema.createStockTake),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { pharmacy, stockTakeDate, type, reason, notes } = req.body;

    // Validate pharmacy exists
    const pharmacyDoc = await PharmacyRepo.findById(
      new Types.ObjectId(pharmacy),
    );
    if (!pharmacyDoc) {
      throw new NotFoundError('Pharmacy not found');
    }

    // Check permissions
    const user = req.user as User;
    if (
      user.role !== 'ADMIN' &&
      user.role !== 'STAFF' &&
      pharmacyDoc.user._id.toString() !== req.user._id.toString()
    ) {
      throw new ForbiddenError(
        'You do not have permission to conduct stock takes for this pharmacy',
      );
    }

    const stockTake = await StockTakeRepo.create({
      pharmacy: new Types.ObjectId(pharmacy),
      stockTakeDate: stockTakeDate ? new Date(stockTakeDate) : new Date(),
      type,
      reason,
      notes,
      conductedBy: req.user._id,
      items: [],
      totalVariance: 0,
      varianceValue: 0,
    });

    new SuccessResponse('Stock take created successfully', stockTake).send(res);
  }),
);

// GET /api/inventory/stocktake - List stock takes
router.get(
  '/stocktake',
  validator(schema.listStockTakes),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { pharmacy, status, page = 1, limit = 20 } = req.query;

    let stockTakes: any[];
    if (pharmacy) {
      stockTakes = await StockTakeRepo.findByPharmacy(
        new Types.ObjectId(pharmacy as string),
        Number(page),
        Number(limit),
      );
    } else if (status) {
      stockTakes = await StockTakeRepo.findByStatus(
        status as string,
        Number(page),
        Number(limit),
      );
    } else {
      // For non-admin users, only show stock takes for their pharmacies
      const user = req.user as User;
      if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
        const userPharmacy = await PharmacyRepo.findByUserId(req.user._id);
        if (!userPharmacy) {
          stockTakes = [];
        } else {
          stockTakes = await StockTakeRepo.findByPharmacy(
            userPharmacy._id,
            Number(page),
            Number(limit),
          );
        }
      } else {
        stockTakes = await StockTakeRepo.findPendingReview(
          Number(page),
          Number(limit),
        );
      }
    }

    new SuccessResponse('Stock takes retrieved successfully', {
      stockTakes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        hasMore: stockTakes.length === Number(limit),
      },
    }).send(res);
  }),
);

// GET /api/inventory/stocktake/{id} - Get stock take details
router.get(
  '/stocktake/:id',
  validator(schema.stockTakeId),
  asyncHandler(async (req: ProtectedRequest, res) => {
    if (!Types.ObjectId.isValid(req.params.id)) {
      throw new BadRequestError('Invalid stock take ID format');
    }

    const stockTake = await StockTakeRepo.findById(
      new Types.ObjectId(req.params.id),
    );

    if (!stockTake) {
      throw new NotFoundError('Stock take not found');
    }

    new SuccessResponse('Stock take retrieved successfully', stockTake).send(
      res,
    );
  }),
);

// POST /api/inventory/stocktake/{id}/items - Add items to stock take
router.post(
  '/stocktake/:id/items',
  validator(schema.addStockTakeItems),
  asyncHandler(async (req: ProtectedRequest, res) => {
    if (!Types.ObjectId.isValid(req.params.id)) {
      throw new BadRequestError('Invalid stock take ID format');
    }

    const { items } = req.body;

    const stockTake = await StockTakeRepo.addItems(
      new Types.ObjectId(req.params.id),
      items,
    );

    if (!stockTake) {
      throw new NotFoundError('Stock take not found');
    }

    new SuccessResponse(
      'Items added to stock take successfully',
      stockTake,
    ).send(res);
  }),
);

// PUT /api/inventory/stocktake/{id}/status - Update stock take status
router.put(
  '/stocktake/:id/status',
  validator(schema.updateStockTakeStatus),
  asyncHandler(async (req: ProtectedRequest, res) => {
    if (!Types.ObjectId.isValid(req.params.id)) {
      throw new BadRequestError('Invalid stock take ID format');
    }

    const { status } = req.body;

    const stockTake = await StockTakeRepo.updateStatus(
      new Types.ObjectId(req.params.id),
      status,
      req.user._id,
    );

    if (!stockTake) {
      throw new NotFoundError('Stock take not found');
    }

    new SuccessResponse(
      'Stock take status updated successfully',
      stockTake,
    ).send(res);
  }),
);

// ALERT ROUTES

// GET /api/inventory/low-stock - Get low stock alerts
router.get(
  '/low-stock',
  validator(schema.getLowStock),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { pharmacy, threshold = 10, page = 1, limit = 20 } = req.query;

    const pharmacyId = pharmacy
      ? new Types.ObjectId(pharmacy as string)
      : undefined;

    const lowStockItems = await InventoryRepo.findLowStock(
      pharmacyId,
      Number(threshold),
    );

    // Paginate results
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedItems = lowStockItems.slice(startIndex, endIndex);

    new SuccessResponse('Low stock items retrieved successfully', {
      items: paginatedItems,
      total: lowStockItems.length,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        hasMore: endIndex < lowStockItems.length,
      },
    }).send(res);
  }),
);

// GET /api/inventory/expiring - Get expiring medication alerts
router.get(
  '/expiring',
  validator(schema.getExpiringMedications),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { pharmacy, daysAhead = 30, page = 1, limit = 20 } = req.query;

    const pharmacyId = pharmacy
      ? new Types.ObjectId(pharmacy as string)
      : undefined;

    const expiringMedications = await InventoryRepo.findExpiringMedications(
      pharmacyId,
      Number(daysAhead),
    );

    // Paginate results
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedItems = expiringMedications.slice(startIndex, endIndex);

    new SuccessResponse('Expiring medications retrieved successfully', {
      items: paginatedItems,
      total: expiringMedications.length,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        hasMore: endIndex < expiringMedications.length,
      },
    }).send(res);
  }),
);

// GET /api/inventory/alerts - Get all inventory alerts
router.get(
  '/alerts',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { pharmacy } = req.query;

    const pharmacyId = pharmacy
      ? new Types.ObjectId(pharmacy as string)
      : undefined;

    const alerts = await InventoryRepo.getInventoryAlerts(pharmacyId);

    new SuccessResponse('Inventory alerts retrieved successfully', alerts).send(
      res,
    );
  }),
);

export default router;

import { ForbiddenError } from '../core/ApiError';

import { Types } from 'mongoose';
import { BadRequestError } from '../core/ApiError';
import PharmacyRepo from '../database/repository/PharmacyRepo';
import asyncHandler from '../helpers/asyncHandler';
import { ProtectedRequest } from '../types/app-request';

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

export default checkPharmacyOwnership;

import express from 'express';
import { ProtectedRequest } from '../../types/app-request';
import asyncHandler from '../../helpers/asyncHandler';
import AmbulanceRepo from '../../database/repository/AmbulanceRepo';
import { SuccessResponse } from '../../core/ApiResponse';
import { Types } from 'mongoose';
import validator from '../../helpers/validator';
import schema from './schema';
import { BadRequestError, NotFoundError } from '../../core/ApiError';
import authentication from '../../auth/authentication';
import ambulanceAuth from '../../auth/ambulanceAuth';

const router = express.Router({ mergeParams: true });

router.use(authentication);

// Get ambulance location
router.get(
  '/',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { ambulanceId } = req.params;

    const ambulance = await AmbulanceRepo.findById(
      new Types.ObjectId(ambulanceId),
    );
    if (!ambulance) throw new NotFoundError('Ambulance not found');

    if (!ambulance.baseLocation) {
      throw new NotFoundError('Ambulance location not set');
    }

    new SuccessResponse(
      'Ambulance location retrieved successfully',
      ambulance.baseLocation,
    ).send(res);
  }),
);

// Update ambulance location
router.put(
  '/',
  ambulanceAuth,
  validator(schema.updateLocation),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { ambulanceId } = req.params;
    const location = req.body;

    const ambulance = await AmbulanceRepo.findById(
      new Types.ObjectId(ambulanceId),
    );
    if (!ambulance) throw new NotFoundError('Ambulance not found');

    // Update the location
    ambulance.baseLocation = location;
    const updatedAmbulance = await AmbulanceRepo.update(ambulance);
    if (!updatedAmbulance)
      throw new BadRequestError('Failed to update ambulance location');

    new SuccessResponse(
      'Ambulance location updated successfully',
      updatedAmbulance.baseLocation,
    ).send(res);
  }),
);

export default router;

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

// Add new coverage area
router.post(
  '/',
  ambulanceAuth,
  validator(schema.addCoverage),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { ambulanceId } = req.params;
    const coverage = req.body;

    const ambulance = await AmbulanceRepo.addCoverage(
      new Types.ObjectId(ambulanceId),
      coverage,
    );
    if (!ambulance) throw new BadRequestError('Ambulance coverage not added');

    new SuccessResponse('Coverage area added successfully', ambulance).send(
      res,
    );
  }),
);

// Update existing coverage area
router.put(
  '/:coverageId',
  ambulanceAuth,
  validator(schema.updateCoverage),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { ambulanceId, coverageId } = req.params;
    const updates = req.body;

    const ambulance = await AmbulanceRepo.updateCoverage(
      new Types.ObjectId(ambulanceId),
      coverageId,
      updates,
    );
    if (!ambulance) throw new NotFoundError('Coverage area not found');

    new SuccessResponse('Coverage area updated successfully', ambulance).send(
      res,
    );
  }),
);

// Delete coverage area
router.delete(
  '/:coverageId',
  ambulanceAuth,
  validator(schema.deleteCoverage),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { ambulanceId, coverageId } = req.params;

    const ambulance = await AmbulanceRepo.deleteCoverage(
      new Types.ObjectId(ambulanceId),
      coverageId,
    );
    if (!ambulance) throw new NotFoundError('Coverage area not found');

    new SuccessResponse('Coverage area deleted successfully', ambulance).send(
      res,
    );
  }),
);

// Get specific coverage area
router.get(
  '/:coverageId',
  ambulanceAuth,
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { ambulanceId, coverageId } = req.params;

    const ambulance = await AmbulanceRepo.getCoverageById(
      new Types.ObjectId(ambulanceId),
      coverageId,
    );
    if (!ambulance) throw new NotFoundError('Coverage area not found');

    const coverage = ambulance.coverage?.find(
      (c) => c._id?.toString() === coverageId,
    );

    new SuccessResponse('Coverage area retrieved successfully', coverage).send(
      res,
    );
  }),
);

export default router;

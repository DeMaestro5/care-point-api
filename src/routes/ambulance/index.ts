import express from 'express';
import { SuccessResponse } from '../../core/ApiResponse';
import AmbulanceRepo from '../../database/repository/AmbulanceRepo';
import { ProtectedRequest } from 'app-request';
import { BadRequestError } from '../../core/ApiError';
import asyncHandler from '../../helpers/asyncHandler';
import authentication from '../../auth/authentication';
import { Types } from 'mongoose';
import coverageRouter from './coverage';
import emergencyRequestRouter from './emergency-request';

const router = express.Router();

/*-------------------------------------------------------------------------*/
router.use(authentication);
/*-------------------------------------------------------------------------*/

router.use('/coverage', coverageRouter);
router.use('/emergency-requests', emergencyRequestRouter);

router.get(
  '/',
  asyncHandler(async (_req: ProtectedRequest, res) => {
    const ambulances = await AmbulanceRepo.findAll();
    if (!ambulances) throw new BadRequestError('Ambulances not found');
    new SuccessResponse('success', ambulances).send(res);
  }),
);

router.get(
  '/:ambulanceId',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const ambulance = await AmbulanceRepo.findById(
      new Types.ObjectId(req.params.ambulanceId),
    );
    if (!ambulance) throw new BadRequestError('Ambulance not found');
    new SuccessResponse('success', ambulance).send(res);
  }),
);

export default router;

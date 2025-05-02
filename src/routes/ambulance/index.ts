import express from 'express';
import { SuccessResponse } from '../../core/ApiResponse';
import AmbulanceRepo from '../../database/repository/AmbulanceRepo';
import { ProtectedRequest } from 'app-request';
import { BadRequestError } from '../../core/ApiError';
import validator from '../../helpers/validator';
import schema from './schema';
import asyncHandler from '../../helpers/asyncHandler';
import authentication from '../../auth/authentication';
import { Types } from 'mongoose';

const router = express.Router();

/*-------------------------------------------------------------------------*/
router.use(authentication);
/*-------------------------------------------------------------------------*/

router.get(
  '/:id',
  validator(schema.ambulanceId),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const ambulance = await AmbulanceRepo.findById(
      new Types.ObjectId(req.params.id),
    );
    if (!ambulance) throw new BadRequestError('Ambulance not found');
    new SuccessResponse('success', ambulance).send(res);
  }),
);

export default router;

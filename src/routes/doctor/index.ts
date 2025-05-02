import express from 'express';
import { SuccessResponse } from '../../core/ApiResponse';
import DoctorRepo from '../../database/repository/DoctorRepo';
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
  validator(schema.doctorId),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const doctor = await DoctorRepo.findById(new Types.ObjectId(req.params.id));
    if (!doctor) throw new BadRequestError('Doctor not found');
    new SuccessResponse('success', doctor).send(res);
  }),
);

export default router;

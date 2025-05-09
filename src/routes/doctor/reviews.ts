import express from 'express';
import asyncHandler from '../../helpers/asyncHandler';
import { ProtectedRequest } from 'app-request';
import { BadRequestError } from '../../core/ApiError';
import { SuccessResponse } from '../../core/ApiResponse';
import { Types } from 'mongoose';
import DoctorRepo from '../../database/repository/DoctorRepo';
import ReviewRepo from '../../database/repository/ReviewRepo';

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const doctorId = await DoctorRepo.findById(
      new Types.ObjectId(req.params.doctorId),
    );
    if (!doctorId) throw new BadRequestError('Doctor not found');

    const reviews = await ReviewRepo.findByDoctorId(doctorId._id);
    if (reviews.length === 0) throw new BadRequestError('No reviews found');

    new SuccessResponse('success', reviews).send(res);
  }),
);

export default router;

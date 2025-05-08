import express from 'express';
import validator from '../../helpers/validator';
import asyncHandler from '../../helpers/asyncHandler';
import { ProtectedRequest } from '../../types/app-request';
import DoctorRepo from '../../database/repository/DoctorRepo';
import schema from './schema';
import { Types } from 'mongoose';
import { BadRequestError } from '../../core/ApiError';
import { SuccessResponse } from '../../core/ApiResponse';

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const doctorId = await DoctorRepo.findById(
      new Types.ObjectId(req.params.doctorId),
    );
    if (!doctorId) throw new BadRequestError('Doctor not found');

    new SuccessResponse('success', doctorId.availability).send(res);
  }),
);

router.put(
  '/',
  validator(schema.updateAvailability),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const doctorId = await DoctorRepo.findById(
      new Types.ObjectId(req.params.doctorId),
    );
    if (!doctorId) throw new BadRequestError('Doctor not found');

    const updatedDoctor = await DoctorRepo.update({
      _id: doctorId._id,
      user: doctorId.user,
      availability: req.body.availability,
    });

    if (!updatedDoctor)
      throw new BadRequestError('Failed to update doctor availability');
    new SuccessResponse(
      'Doctor availability updated successfully',
      updatedDoctor.availability,
    ).send(res);
  }),
);

export default router;

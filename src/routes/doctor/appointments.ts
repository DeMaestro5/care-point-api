import express from 'express';
import asyncHandler from '../../helpers/asyncHandler';
import { ProtectedRequest } from '../../types/app-request';
import DoctorRepo from '../../database/repository/DoctorRepo';
import AppointmentRepo from '../../database/repository/AppointmentRepo';
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

    const appointments = await AppointmentRepo.findByDoctorId(doctorId._id);
    if (appointments.length === 0)
      throw new BadRequestError('No appointments found');

    new SuccessResponse('success', appointments).send(res);
  }),
);

export default router;

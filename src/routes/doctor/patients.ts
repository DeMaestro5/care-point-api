import express from 'express';
import asyncHandler from '../../helpers/asyncHandler';
import { ProtectedRequest } from '../../types/app-request';
import DoctorRepo from '../../database/repository/DoctorRepo';
import { Types } from 'mongoose';
import PatientRepo from '../../database/repository/PatientRepo';
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

    const patients = await PatientRepo.findByDoctorId(doctorId._id);
    if (patients.length === 0) throw new BadRequestError('No patients found');

    new SuccessResponse('success', patients).send(res);
  }),
);
export default router;

import express from 'express';
import asyncHandler from '../../helpers/asyncHandler';
import { ProtectedRequest } from 'app-request';
import { BadRequestError } from '../../core/ApiError';
import { SuccessResponse } from '../../core/ApiResponse';
import { Types } from 'mongoose';
import DoctorRepo from '../../database/repository/DoctorRepo';

const router = express.Router({ mergeParams: true });

// Get doctor's specializations
router.get(
  '/',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const doctor = await DoctorRepo.findById(
      new Types.ObjectId(req.params.doctorId),
    );
    if (!doctor) throw new BadRequestError('Doctor not found');

    new SuccessResponse('success', {
      specialization: doctor.specialization,
    }).send(res);
  }),
);

// Update doctor's specializations
router.put(
  '/',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const doctor = await DoctorRepo.findById(
      new Types.ObjectId(req.params.doctorId),
    );
    if (!doctor) throw new BadRequestError('Doctor not found');

    const { specialization } = req.body;
    if (!specialization)
      throw new BadRequestError('Specialization is required');

    doctor.specialization = specialization;
    const updatedDoctor = await DoctorRepo.update(doctor);
    if (!updatedDoctor)
      throw new BadRequestError('Failed to update specialization');

    new SuccessResponse('Specialization updated successfully', {
      specialization: updatedDoctor.specialization,
    }).send(res);
  }),
);

export default router;

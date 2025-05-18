import express from 'express';
import { Types } from 'mongoose';
import asyncHandler from '../../helpers/asyncHandler';
import { ProtectedRequest } from 'app-request';
import { SuccessResponse } from '../../core/ApiResponse';
import PrescriptionRepo from '../../database/repository/PrescriptionRepo';
import validator from '../../helpers/validator';
import schema from './schema';
import { BadRequestError } from '../../core/ApiError';
import DoctorRepo from '../../database/repository/DoctorRepo';
import doctorAuth from '../../auth/doctorAuth';

const router = express.Router({ mergeParams: true });

router.put(
  '/',
  validator(schema.updatePrescriptionStatus),
  doctorAuth,
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { prescriptionId } = req.params;
    const { status } = req.body;

    if (!prescriptionId) {
      throw new BadRequestError('Prescription ID is required');
    }

    // Find the prescription
    const prescription = await PrescriptionRepo.findById(
      new Types.ObjectId(prescriptionId),
    );

    if (!prescription) {
      throw new BadRequestError('Prescription not found');
    }

    // Verify the doctor owns this prescription
    const doctor = await DoctorRepo.findByUserId(
      new Types.ObjectId(req.user._id),
    );

    if (!doctor) {
      throw new BadRequestError('Doctor not found');
    }

    // Check if doctor ID matches
    const isDoctorMatch =
      prescription.doctor.toString() === doctor._id.toString();

    if (!isDoctorMatch) {
      throw new BadRequestError(
        'You are not authorized to update this prescription status',
      );
    }

    // Update the status
    const updatedPrescription = await PrescriptionRepo.update(
      new Types.ObjectId(prescriptionId),
      { status, updatedAt: new Date() },
    );
    if (!updatedPrescription)
      throw new BadRequestError('Failed to update prescription status');

    new SuccessResponse(
      'Prescription status updated successfully',
      updatedPrescription,
    ).send(res);
  }),
);

export default router;

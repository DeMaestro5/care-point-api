import express from 'express';
import { SuccessResponse } from '../../core/ApiResponse';
import { Types } from 'mongoose';
import PrescriptionRepo from '../../database/repository/PrescriptionRepo';
import { BadRequestError } from '../../core/ApiError';
import pharmacyAuth from '../../auth/pharmacyAuth';
import asyncHandler from '../../helpers/asyncHandler';
import { ProtectedRequest } from '../../types/app-request';
import validator from '../../helpers/validator';
import schema from './schema';

const router = express.Router({ mergeParams: true });

router.post(
  '/',
  validator(schema.verifyPrescription),
  pharmacyAuth,
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { prescriptionId } = req.params;
    const { verified, notes } = req.body;

    const prescription = await PrescriptionRepo.findById(
      new Types.ObjectId(prescriptionId),
    );

    if (!prescription) throw new BadRequestError('Prescription not found');

    // Verify that the pharmacy has access to this prescription
    if (prescription.pharmacy?.toString() !== req.params.pharmacyId) {
      throw new BadRequestError('Unauthorized access to prescription');
    }

    const updatedPrescription = await PrescriptionRepo.update(
      new Types.ObjectId(prescriptionId),
      {
        verification: {
          verified,
          verifiedBy: req.user._id,
          verifiedAt: new Date(),
          notes,
        },
      },
    );

    new SuccessResponse(
      verified
        ? 'Prescription verified successfully'
        : 'Prescription verification failed',
      updatedPrescription,
    ).send(res);
  }),
);
export default router;

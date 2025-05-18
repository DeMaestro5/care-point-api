import express from 'express';
import PrescriptionRepo from '../../database/repository/PrescriptionRepo';
import { Types } from 'mongoose';
import { SuccessResponse } from '../../core/ApiResponse';
import { BadRequestError } from '../../core/ApiError';
import pharmacyAuth from '../../auth/pharmacyAuth';
import asyncHandler from '../../helpers/asyncHandler';
import { ProtectedRequest } from '../../types/app-request';
import validator from '../../helpers/validator';
import schema from './schema';

const router = express.Router({ mergeParams: true });

router.post(
  '/',
  validator(schema.dispensePrescription),
  pharmacyAuth,
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { prescriptionId } = req.params;
    const { dispensedBy, notes } = req.body;

    const prescription = await PrescriptionRepo.findById(
      new Types.ObjectId(prescriptionId),
    );
    if (!prescription) throw new BadRequestError('Prescription not found');

    // Verify that the pharmacy has access to this prescription
    if (prescription.pharmacy?.toString() !== req.params.pharmacyId) {
      throw new BadRequestError('Unauthorized access to prescription');
    }

    // Verify that the prescription has been verified
    if (!prescription.verification?.verified) {
      throw new BadRequestError(
        'Prescription must be verified before dispensing',
      );
    }

    const updatedPrescription = await PrescriptionRepo.update(
      new Types.ObjectId(prescriptionId),
      {
        dispensing: {
          dispensedBy: new Types.ObjectId(dispensedBy),
          dispensedAt: new Date(),
          notes,
        },
        status: 'COMPLETED',
      },
    );

    new SuccessResponse(
      'Medication dispensed successfully',
      updatedPrescription,
    ).send(res);
  }),
);

export default router;

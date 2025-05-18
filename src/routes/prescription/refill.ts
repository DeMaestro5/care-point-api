import express from 'express';
import { Types } from 'mongoose';
import asyncHandler from '../../helpers/asyncHandler';
import { ProtectedRequest } from 'app-request';
import { SuccessResponse } from '../../core/ApiResponse';
import PrescriptionRepo from '../../database/repository/PrescriptionRepo';
import validator from '../../helpers/validator';
import schema from './schema';
import { BadRequestError } from '../../core/ApiError';
import PatientRepo from '../../database/repository/PatientRepo';
import PharmacyRepo from '../../database/repository/PharmacyRepo';

const router = express.Router({ mergeParams: true });

router.post(
  '/',
  validator(schema.requestPrescriptionRefill),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { prescriptionId } = req.params;
    const { reason, preferredPharmacyId } = req.body;

    if (!prescriptionId) {
      throw new BadRequestError('Prescription ID is required');
    }

    // Find the prescription
    const prescription = await PrescriptionRepo.findById(
      new Types.ObjectId(prescriptionId),
    );

    if (!prescription) throw new BadRequestError('Prescription not found');

    // Verify the patient owns this prescription
    const patient = await PatientRepo.findByUserId(
      new Types.ObjectId(req.user._id),
    );
    if (!patient) throw new BadRequestError('Patient not found');
    if (!prescription.patient.equals(patient._id)) {
      throw new BadRequestError(
        'You are not authorized to request a refill for this prescription',
      );
    }

    // Verify prescription is active
    if (prescription.status !== 'ACTIVE') {
      throw new BadRequestError('Only active prescriptions can be refilled');
    }

    // If preferred pharmacy is provided, verify it exists
    if (preferredPharmacyId) {
      const pharmacy = await PharmacyRepo.findById(
        new Types.ObjectId(preferredPharmacyId),
      );
      if (!pharmacy) throw new BadRequestError('Preferred pharmacy not found');
    }

    // Update prescription with refill request
    const updatedPrescription = await PrescriptionRepo.update(
      new Types.ObjectId(prescriptionId),
      {
        refillRequest: {
          reason,
          preferredPharmacy: preferredPharmacyId
            ? new Types.ObjectId(preferredPharmacyId)
            : undefined,
          status: 'PENDING',
          requestedAt: new Date(),
        },
        updatedAt: new Date(),
      },
    );

    console.log('Update Result:', {
      prescriptionId,
      updated: !!updatedPrescription,
    });

    if (!updatedPrescription)
      throw new BadRequestError('Failed to create refill request');

    new SuccessResponse(
      'Refill request created successfully',
      updatedPrescription,
    ).send(res);
  }),
);

export default router;

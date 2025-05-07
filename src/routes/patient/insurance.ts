import { Router } from 'express';
import validator from '../../helpers/validator';
import schema from './schema';
import InsuranceRepo from '../../database/repository/InsuranceRepo';
import { NotFoundError, BadRequestError } from '../../core/ApiError';
import asyncHandler from '../../helpers/asyncHandler';
import { ProtectedRequest } from 'app-request';
import { Types } from 'mongoose';

const router = Router({ mergeParams: true });

/**
 * @route GET /api/patients/:id/insurance
 * @desc Get patient's insurance information
 * @access Private
 */
router.get(
  '/',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const patientId = new Types.ObjectId(req.params.patientId);
    const insurance = await InsuranceRepo.findByPatientId(patientId);
    if (!patientId) {
      throw new NotFoundError('Patient not found');
    }

    if (!insurance) {
      return res.status(200).json({ data: null });
    }

    res.status(200).json({ data: insurance });
  }),
);

/**
 * @route PUT /api/patients/:id/insurance/:insuranceId
 * @desc Update patient's insurance information
 * @access Private
 */
router.put(
  '/:insuranceId',
  validator(schema.insurance),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const patientId = new Types.ObjectId(req.params.patientId);
    if (!patientId) {
      throw new NotFoundError('Patient not found');
    }

    const insurance = await InsuranceRepo.findById(patientId);
    if (!insurance) {
      throw new NotFoundError('Insurance record not found');
    }

    // Verify that the insurance belongs to the patient
    if (insurance.patientId.toString() !== patientId.toString()) {
      throw new BadRequestError(
        'Insurance record does not belong to this patient',
      );
    }

    const updatedInsurance = await InsuranceRepo.update(patientId, req.body);
    if (!updatedInsurance) {
      throw new NotFoundError('Failed to update insurance information');
    }

    res.status(200).json({ data: updatedInsurance });
  }),
);

export default router;

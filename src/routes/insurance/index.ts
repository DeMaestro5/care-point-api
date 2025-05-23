import express from 'express';
import asyncHandler from '../../helpers/asyncHandler';
import schema from './schema';
import { Types } from 'mongoose';
import { NotFoundError } from '../../core/ApiError';
import InsuranceRepo from '../../database/repository/InsuranceRepo';
import InsuranceClaimRepo from '../../database/repository/InsuranceClaimRepo';
import { ProtectedRequest } from 'app-request';
import validator from '../../helpers/validator';

const router = express.Router();

// Verify insurance coverage
router.post(
  '/verify',
  validator(schema.verifyInsurance),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { patientId, amount } = req.body;

    const insurance = await InsuranceRepo.findByPatientId(
      new Types.ObjectId(patientId),
    );
    if (!insurance) {
      throw new NotFoundError('Insurance not found for this patient');
    }

    // Here you would typically integrate with the insurance provider's API
    // For now, we'll return a mock response
    const coverage = {
      isCovered: true,
      coverageAmount: amount,
      deductible: 0,
      coInsurance: 0,
      outOfPocket: 0,
    };

    res.status(200).json({ data: coverage });
  }),
);

// Submit insurance claim
router.post(
  '/claims',
  validator(schema.submitClaim),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const {
      patientId,
      insuranceId,
      serviceType,
      amount,
      description,
      documents,
      dateOfService,
    } = req.body;

    const insurance = await InsuranceRepo.findById(
      new Types.ObjectId(insuranceId),
    );
    if (!insurance) {
      throw new NotFoundError('Insurance not found');
    }

    const claim = await InsuranceClaimRepo.create({
      patientId: new Types.ObjectId(patientId),
      insuranceId: new Types.ObjectId(insuranceId),
      serviceType,
      amount,
      description,
      documents,
      dateOfService,
      status: 'PENDING',
    });

    res.status(201).json({ data: claim });
  }),
);

// List insurance providers
router.get(
  '/providers',
  asyncHandler(async (req: ProtectedRequest, res) => {
    // In a real application, this would come from a database or external API
    const providers = [
      { id: '1', name: 'Blue Cross Blue Shield', type: 'HEALTH' },
      { id: '2', name: 'Aetna', type: 'HEALTH' },
      { id: '3', name: 'UnitedHealthcare', type: 'HEALTH' },
      { id: '4', name: 'Cigna', type: 'HEALTH' },
    ];

    res.status(200).json({ data: providers });
  }),
);

// Check specific coverage
router.get(
  '/coverage',
  validator(schema.coverage),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { patientId, serviceType } = req.query;

    const insurance = await InsuranceRepo.findByPatientId(
      new Types.ObjectId(patientId as string),
    );
    if (!insurance) {
      throw new NotFoundError('Insurance not found for this patient');
    }

    // Here you would typically check the specific coverage details
    // For now, we'll return a mock response
    const coverage = {
      serviceType,
      isCovered: true,
      coverageDetails: {
        inNetwork: true,
        outOfNetwork: false,
        copay: 20,
        deductible: 1000,
        coinsurance: '20%',
      },
    };

    res.status(200).json({ data: coverage });
  }),
);

// Get claim status
router.get(
  '/claims/:id',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const claim = await InsuranceClaimRepo.findById(
      new Types.ObjectId(req.params.id),
    );
    if (!claim) {
      throw new NotFoundError('Claim not found');
    }

    res.status(200).json({ data: claim });
  }),
);
export default router;

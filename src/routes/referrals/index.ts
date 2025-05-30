import { Router } from 'express';
import asyncHandler from '../../helpers/asyncHandler';
import validator from '../../helpers/validator';
import schema from './schema';
import { ProtectedRequest } from '../../types/app-request';
import { SuccessResponse } from '../../core/ApiResponse';
import { BadRequestError } from '../../core/ApiError';
import ReferralRepo from '../../database/repository/ReferralRepo';
import { Types } from 'mongoose';
import { Response } from 'express';
import authentication from '../../auth/authentication';

const router = Router();

/*-------------------------------------------------------------------------*/
router.use(authentication);

// Create referral to specialist
router.post(
  '/',
  validator(schema.createReferral),
  asyncHandler(async (req: ProtectedRequest, res: Response) => {
    const referral = await ReferralRepo.create({
      ...req.body,
      referredBy: req.user._id,
    });
    new SuccessResponse('Referral created successfully', referral).send(res);
  }),
);

// Get referral details
router.get(
  '/:id',
  asyncHandler(async (req: ProtectedRequest, res: Response) => {
    const referral = await ReferralRepo.findById(
      new Types.ObjectId(req.params.id),
    );
    if (!referral) throw new BadRequestError('Referral not found');
    new SuccessResponse('Referral retrieved successfully', referral).send(res);
  }),
);

// Update referral status
router.put(
  '/:id/status',
  validator(schema.updateReferralStatus),
  asyncHandler(async (req: ProtectedRequest, res: Response) => {
    const referral = await ReferralRepo.update(
      new Types.ObjectId(req.params.id),
      req.body,
    );
    if (!referral) throw new BadRequestError('Referral not found');
    new SuccessResponse('Referral status updated successfully', referral).send(
      res,
    );
  }),
);

// List incoming referrals for a doctor
router.get(
  '/doctors/:id/referrals',
  asyncHandler(async (req: ProtectedRequest, res: Response) => {
    const { referrals } = await ReferralRepo.findByDoctorId(
      new Types.ObjectId(req.params.id),
    );
    new SuccessResponse(
      'Doctor referrals retrieved successfully',
      referrals,
    ).send(res);
  }),
);

// List patient's referrals
router.get(
  '/patients/:id/referrals',
  asyncHandler(async (req: ProtectedRequest, res: Response) => {
    const { referrals } = await ReferralRepo.findByPatientId(
      new Types.ObjectId(req.params.id),
    );
    new SuccessResponse(
      'Patient referrals retrieved successfully',
      referrals,
    ).send(res);
  }),
);

export default router;

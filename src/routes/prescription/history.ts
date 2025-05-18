import express from 'express';
import PrescriptionRepo from '../../database/repository/PrescriptionRepo';
import { SuccessResponse } from '../../core/ApiResponse';
import asyncHandler from '../../helpers/asyncHandler';
import { BadRequestError } from '../../core/ApiError';
import { ProtectedRequest } from '../../types/app-request';
import { Types } from 'mongoose';

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { prescriptionId } = req.params;
    const prescription = await PrescriptionRepo.findById(
      new Types.ObjectId(prescriptionId),
    );
    if (!prescription) throw new BadRequestError('Prescription not found');
    new SuccessResponse('Prescription history', prescription).send(res);
  }),
);

export default router;

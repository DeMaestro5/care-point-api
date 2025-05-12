import express from 'express';
import { Types } from 'mongoose';
import asyncHandler from '../../helpers/asyncHandler';
import { ProtectedRequest } from 'app-request';
import { BadRequestError } from '../../core/ApiError';
import { SuccessResponse } from '../../core/ApiResponse';
import MedicationRepo from '../../database/repository/MedicationRepo';
import validator from '../../helpers/validator';
import schema from './schema';

const router = express.Router({ mergeParams: true });

// Search medications
router.get(
  '/',
  validator(schema.searchMedications),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { query = '', page = 1, limit = 10 } = req.query;

    const { medications, total } = await MedicationRepo.search(
      query as string,
      Number(page),
      Number(limit),
    );

    new SuccessResponse('success', {
      medications,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    }).send(res);
  }),
);

// Get medication details
router.get(
  '/:id',
  validator(schema.getMedication),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const medication = await MedicationRepo.findById(
      new Types.ObjectId(req.params.id),
    );

    if (!medication) {
      throw new BadRequestError('Medication not found');
    }

    new SuccessResponse('success', medication).send(res);
  }),
);

export default router;

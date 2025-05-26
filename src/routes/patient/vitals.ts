import { Router } from 'express';
import { PatientModel } from '../../database/model/Patient';
import { NotFoundError } from '../../core/ApiError';
import validator from '../../helpers/validator';
import { ProtectedRequest } from '../../types/app-request';
import asyncHandler from '../../helpers/asyncHandler';
import VitalSignsRepo from '../../database/repository/VitalSignsRepo';
import schema from './schema';

const router = Router({ mergeParams: true });

router.post(
  '/vitals',
  validator(schema.vitalSigns),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { patientId } = req.params;
    const patient = await PatientModel.findOne({
      _id: patientId,
      user: req.user._id,
    });

    if (!patient) {
      throw new NotFoundError('Patient not found or does not belong to you');
    }

    const vitalSigns = await VitalSignsRepo.create(
      patient._id,
      req.user._id,
      req.body,
    );

    res.status(201).json({
      message: 'Vital signs recorded successfully',
      vitalSigns,
    });
  }),
);

router.get(
  '/vitals-history',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { patientId } = req.params;
    const { page, limit, startDate, endDate } = req.query;

    const patient = await PatientModel.findOne({
      _id: patientId,
      user: req.user._id,
    });

    if (!patient) {
      throw new NotFoundError('Patient not found or does not belong to you');
    }

    const { vitalSigns, total } = await VitalSignsRepo.findByPatientId(
      patient._id,
      {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      },
    );

    res.json({
      vitalSigns,
      pagination: {
        total,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
      },
    });
  }),
);

export default router;

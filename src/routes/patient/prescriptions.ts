import express from 'express';
import { Types } from 'mongoose';
import asyncHandler from '../../helpers/asyncHandler';
import { ProtectedRequest } from '../../types/app-request';
import {
  NotFoundResponse,
  SuccessResponse,
  ForbiddenResponse,
} from '../../core/ApiResponse';
import PrescriptionRepo from '../../database/repository/PrescriptionRepo';
import { Response } from 'express';
import validator from '../../helpers/validator';
import schema from './schema';

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  asyncHandler(async (req: ProtectedRequest, res: Response) => {
    const patientId = new Types.ObjectId(req.params.patientId);

    const prescriptions = await PrescriptionRepo.findByPatientId(patientId);
    if (prescriptions.length === 0) {
      return new NotFoundResponse('No prescriptions found').send(res);
    }

    return new SuccessResponse(
      'Prescriptions retrieved successfully',
      prescriptions,
    ).send(res);
  }),
);

router.post(
  '/',
  validator(schema.prescription),
  asyncHandler(async (req: ProtectedRequest, res: Response) => {
    // Check if user is a doctor
    if (req.user.role !== 'DOCTOR') {
      return new ForbiddenResponse(
        'Only doctors can create prescriptions',
      ).send(res);
    }

    const patientId = new Types.ObjectId(req.params.patientId);
    const doctorId = new Types.ObjectId(req.user._id);

    const prescription = await PrescriptionRepo.create({
      ...req.body,
      patient: patientId,
      doctor: doctorId,
      status: 'ACTIVE',
    });

    return new SuccessResponse(
      'Prescription created successfully',
      prescription,
    ).send(res);
  }),
);

export default router;

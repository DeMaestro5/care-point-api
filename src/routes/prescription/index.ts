import express from 'express';
import { Types } from 'mongoose';
import asyncHandler from '../../helpers/asyncHandler';
import { ProtectedRequest } from 'app-request';
import { SuccessResponse } from '../../core/ApiResponse';
import PrescriptionRepo from '../../database/repository/PrescriptionRepo';
import validator from '../../helpers/validator';
import schema from './schema';

const router = express.Router();

// List prescriptions with filtering
router.get(
  '/',
  validator(schema.listPrescriptions),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const {
      page = 1,
      limit = 10,
      status,
      patientId,
      doctorId,
      pharmacyId,
    } = req.query;

    // Build filter object
    const filter: any = {};
    if (status) filter.status = status;
    if (patientId) filter.patient = new Types.ObjectId(patientId as string);
    if (doctorId) filter.doctor = new Types.ObjectId(doctorId as string);
    if (pharmacyId) filter.pharmacy = new Types.ObjectId(pharmacyId as string);

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get prescriptions with pagination
    const prescriptions = await PrescriptionRepo.find(
      filter,
      Number(skip),
      Number(limit),
    );

    // Get total count for pagination
    const total = await PrescriptionRepo.count(filter);

    new SuccessResponse('success', {
      prescriptions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    }).send(res);
  }),
);

export default router;

import express from 'express';
import { NotFoundResponse, SuccessResponse } from '../../core/ApiResponse';
import { ForbiddenError } from '../../core/ApiError';
import { ProtectedRequest } from '../../types/app-request';
import { Types } from 'mongoose';
import asyncHandler from '../../helpers/asyncHandler';
import validator from '../../helpers/validator';
import schema from './schema';
import MedicalRecordRepo from '../../database/repository/MedicalRecordRepo';
import doctorAuth from '../../auth/doctorAuth';

const router = express.Router({ mergeParams: true });

/*-------------------------------------------------------------------------*/
// Below all routes require authenticated user
/*-------------------------------------------------------------------------*/

// Get all medical records for a patient
router.get(
  '/',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const patientId = new Types.ObjectId(req.params.patientId);

    // Only allow patients to view their own records or doctors to view any patient's records
    if (
      req.user.role !== 'DOCTOR' &&
      req.user._id.toString() !== patientId.toString()
    ) {
      throw new ForbiddenError('You can only access your own medical records');
    }

    // Get pagination parameters from query
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : undefined;
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : undefined;

    const result = await MedicalRecordRepo.searchMedicalRecords(patientId, {
      page,
      limit,
      startDate,
      endDate,
    });

    if (!result.records.length) {
      return new NotFoundResponse('No medical records found').send(res);
    }

    return new SuccessResponse(
      'Medical records retrieved successfully',
      result,
    ).send(res);
  }),
);

// Create a new medical record (doctors only)
router.post(
  '/',
  doctorAuth,
  validator(schema.medicalRecord),
  asyncHandler(async (req: ProtectedRequest, res) => {
    try {
      const patientId = new Types.ObjectId(req.params.patientId);
      const doctorId = new Types.ObjectId(req.user._id);

      const record = await MedicalRecordRepo.create(patientId, doctorId, {
        diagnosis: req.body.diagnosis,
        treatment: req.body.treatment,
        notes: req.body.notes,
        attachments: req.body.attachments,
      });

      if (!record) {
        throw new NotFoundResponse('Failed to create medical record');
      }

      return new SuccessResponse('Medical record created successfully', {
        record,
      }).send(res);
    } catch (error) {
      console.error('Error creating medical record:', error);
      throw error;
    }
  }),
);

// Update a medical record (doctors only)
router.put(
  '/:recordId',
  doctorAuth,
  validator(schema.medicalRecord),
  asyncHandler(async (req: ProtectedRequest, res) => {
    try {
      const recordId = new Types.ObjectId(req.params.recordId);

      // First fetch the existing record
      const existingRecord = await MedicalRecordRepo.findById(recordId);

      if (!existingRecord) {
        throw new NotFoundResponse('Medical record not found');
      }

      // Only update fields that are provided
      const updateData = {
        ...(req.body.diagnosis && { diagnosis: req.body.diagnosis }),
        ...(req.body.treatment && { treatment: req.body.treatment }),
        ...(req.body.notes !== undefined && { notes: req.body.notes }),
        ...(req.body.attachments !== undefined && {
          attachments: req.body.attachments,
        }),
      };

      const updatedRecord = await MedicalRecordRepo.update(
        recordId,
        updateData,
      );

      if (!updatedRecord) {
        throw new NotFoundResponse('Failed to update medical record');
      }

      return new SuccessResponse('Medical record updated successfully', {
        record: updatedRecord,
      }).send(res);
    } catch (error) {
      console.error('Error updating medical record:', error);
      throw error;
    }
  }),
);

export default router;

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
import type MedicalRecord from '../../database/model/MedicalRecord';
// import { MedicalRecordModel } from '../../database/model/MedicalRecord';

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
      throw error;
    }
  }),
);

// Update a medical record (doctors only)
router.put(
  '/:medicalRecordId',
  doctorAuth,
  validator(schema.medicalRecord),
  asyncHandler(async (req: ProtectedRequest, res) => {
    try {
      const recordId = new Types.ObjectId(req.params.medicalRecordId);
      const doctorId = new Types.ObjectId(req.user._id);
      const patientId = new Types.ObjectId(req.params.patientId);

      // First fetch the existing record
      const existingRecord = await MedicalRecordRepo.findById(recordId);

      if (!existingRecord) {
        throw new NotFoundResponse('Medical record not found');
      }

      // Check if the record belongs to the correct patient
      if (existingRecord.patient.toString() !== patientId.toString()) {
        throw new ForbiddenError(
          'Medical record does not belong to this patient',
        );
      }

      // Check if the record has valid references
      if (!existingRecord.patient || !existingRecord.createdBy) {
        // This is a recovery path for records with missing references
        const fixedRecord = await MedicalRecordRepo.update(recordId, {
          patient: patientId,
          createdBy: doctorId,
        });

        if (fixedRecord) {
          // Re-fetch the record
          const refreshedRecord = await MedicalRecordRepo.findById(recordId);
          if (refreshedRecord) {
            existingRecord.patient = refreshedRecord.patient;
            existingRecord.createdBy = refreshedRecord.createdBy;
          }
        }
      }

      // Get the patient ID from the record
      let recordPatientId = existingRecord.patient;

      // If reference is missing, use the ID from the request
      if (!recordPatientId) {
        recordPatientId = patientId;
      }

      // Handle the update data
      const updateData: Partial<MedicalRecord> = {
        // Ensure we always have valid references
        patient: recordPatientId,
        createdBy: existingRecord.createdBy || doctorId,
      };

      // Only update fields that are provided
      if (req.body.diagnosis) {
        updateData.diagnosis = req.body.diagnosis;
      }
      if (req.body.treatment) {
        updateData.treatment = req.body.treatment;
      }
      if (req.body.notes !== undefined) {
        updateData.notes = req.body.notes;
      }
      if (req.body.attachments !== undefined) {
        updateData.attachments = req.body.attachments;
      }

      const updatedRecord = await MedicalRecordRepo.update(
        recordId,
        updateData,
      );

      if (!updatedRecord) {
        throw new NotFoundResponse('Failed to update medical record');
      }

      return new SuccessResponse('Medical record updated successfully', {
        record: {
          ...updatedRecord,
          patient: { _id: recordPatientId },
          createdBy: { _id: updatedRecord.createdBy || doctorId },
        },
      }).send(res);
    } catch (error) {
      throw error;
    }
  }),
);

export default router;

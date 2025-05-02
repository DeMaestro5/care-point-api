import express from 'express';
import { Types } from 'mongoose';
import { BadRequestError, ForbiddenError } from '../../core/ApiError';
import PatientRepo from '../../database/repository/PatientRepo';
import { ProtectedRequest } from 'app-request';
import asyncHandler from '../../helpers/asyncHandler';
import validator from '../../helpers/validator';
import schema from './schema';
import { SuccessResponse } from '../../core/ApiResponse';

const router = express.Router({ mergeParams: true });

// Add medical history entry (Doctors only)

router.post(
  '/',
  validator(schema.medicalHistory),
  asyncHandler(async (req: ProtectedRequest, res) => {
    if (!Types.ObjectId.isValid(req.params.patientId)) {
      throw new BadRequestError('Invalid patient ID format');
    }
    if (req.user.role !== 'DOCTOR') {
      throw new ForbiddenError('Only doctors can add medical history entries');
    }
    const patientId = new Types.ObjectId(req.params.patientId);
    const newEntry = {
      ...req.body,
      addedBy: req.user._id,
      addedAt: new Date(),
      entryId: new Types.ObjectId(),
    };
    const updatedPatient = await PatientRepo.addMedicalHistory(
      patientId,
      newEntry,
    );
    if (!updatedPatient)
      throw new BadRequestError('Failed to add medical history entry');
    res.json({ message: 'Medical history entry added', entry: newEntry });
  }),
);

// Edit medical history entry (Doctors only)
router.put(
  '/:entryId',
  validator(schema.medicalHistory),
  asyncHandler(async (req: ProtectedRequest, res) => {
    if (
      !Types.ObjectId.isValid(req.params.patientId) ||
      !Types.ObjectId.isValid(req.params.entryId)
    ) {
      throw new BadRequestError('Invalid ID format');
    }
    if (req.user.role !== 'DOCTOR') {
      throw new ForbiddenError('Only doctors can edit medical history entries');
    }
    const patientId = new Types.ObjectId(req.params.patientId);
    const entryId = new Types.ObjectId(req.params.entryId);

    // First, get the existing entry to preserve original fields
    const patient = await PatientRepo.findById(patientId);
    if (!patient) {
      throw new BadRequestError('Patient not found');
    }

    const existingEntry = patient.medicalHistory?.find(
      (entry) => entry.entryId.toString() === entryId.toString(),
    );

    if (!existingEntry) {
      throw new BadRequestError('Medical history entry not found');
    }

    const update = {
      ...req.body,
      entryId,
      addedBy: existingEntry.addedBy, // Preserve original addedBy
      addedAt: existingEntry.addedAt, // Preserve original addedAt
      updatedBy: req.user._id,
      updatedAt: new Date(),
    };

    const updatedPatient = await PatientRepo.updateMedicalHistoryEntry(
      patientId,
      entryId,
      update,
    );
    if (!updatedPatient)
      throw new BadRequestError('Failed to update medical history entry');
    res.json({ message: 'Medical history entry updated', entry: update });
  }),
);

router.get(
  '/',
  validator(schema.patientId),
  asyncHandler(async (req: ProtectedRequest, res) => {
    if (!Types.ObjectId.isValid(req.params.patientId)) {
      throw new BadRequestError('Invalid patient ID format');
    }

    const patientId = new Types.ObjectId(req.params.patientId);

    // Check if patient exists
    const patient = await PatientRepo.findById(patientId);
    if (!patient) {
      throw new BadRequestError('Patient not found');
    }

    // Authorization: only the patient or doctors can view medical history
    const isPatientOwner = patient.user.toString() === req.user._id.toString();
    const isDoctor = req.user.role === 'DOCTOR';

    if (!isPatientOwner && !isDoctor) {
      throw new ForbiddenError(
        "Not authorized to view this patient's medical history",
      );
    }

    // Return medical history with access timestamp for audit
    await PatientRepo.getMedicalHistory(patientId);

    new SuccessResponse('success', {
      medicalHistory: patient.medicalHistory || [],
      // Include additional context for doctors
      ...(isDoctor && {
        patientInfo: {
          dateOfBirth: patient.dateOfBirth,
          gender: patient.gender,
          bloodGroup: patient.bloodGroup,
        },
      }),
    }).send(res);
  }),
);
export default router;

import express from 'express';
import { NotFoundResponse, SuccessResponse } from '../../core/ApiResponse';
import { ForbiddenError } from '../../core/ApiError';
import { ProtectedRequest } from '../../types/app-request';
import { Types } from 'mongoose';
import asyncHandler from '../../helpers/asyncHandler';
import validator from '../../helpers/validator';
import schema from './schema';
import PatientRepo from '../../database/repository/PatientRepo';

const router = express.Router({ mergeParams: true });

/*-------------------------------------------------------------------------*/
// Below all routes require authenticated user
/*-------------------------------------------------------------------------*/

// Get patient allergies
router.get(
  '/',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const patientId = new Types.ObjectId(req.params.patientId);

    // Try to find by direct ID first
    let patient = await PatientRepo.findById(patientId);

    // If not found by ID, try finding by user ID if authenticated user is the patient
    if (!patient && req.user) {
      patient = await PatientRepo.findByUserId(req.user._id);
    }

    // If still not found and the ID matches the user's ID, try again with the user ID
    if (
      !patient &&
      Types.ObjectId.isValid(req.params.patientId) &&
      req.user &&
      req.params.patientId === req.user._id.toString()
    ) {
      patient = await PatientRepo.findByUserId(
        new Types.ObjectId(req.params.patientId),
      );
    }

    if (!patient) {
      throw new NotFoundResponse('Patient not found');
    }

    // Only allow patients to view their own allergies or doctors
    const isPatientOwner = patient.user._id
      ? patient.user._id.toString() === req.user._id.toString()
      : patient.user.toString() === req.user._id.toString();
    const isDoctor = req.user.role === 'DOCTOR';

    if (!isPatientOwner && !isDoctor) {
      throw new ForbiddenError('You can only access your own allergies');
    }

    return new SuccessResponse('Allergies retrieved successfully', {
      allergies: patient.allergies || [],
    }).send(res);
  }),
);

// Update patient allergies
// Modified PUT route for updating allergies

router.put(
  '/',
  validator(schema.updateAllergies),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const patientId = new Types.ObjectId(req.params.patientId);
    // Try to find by direct ID first
    let patient = await PatientRepo.findById(patientId);

    // If not found by ID, try finding by user ID if authenticated user is the patient
    if (!patient && req.user) {
      patient = await PatientRepo.findByUserId(req.user._id);
    }

    // If still not found and the ID matches the user's ID, try again with the user ID
    if (
      !patient &&
      Types.ObjectId.isValid(req.params.patientId) &&
      req.user &&
      req.params.patientId === req.user._id.toString()
    ) {
      patient = await PatientRepo.findByUserId(
        new Types.ObjectId(req.params.patientId),
      );
    }

    if (!patient) {
      throw new NotFoundResponse('Patient not found');
    }

    // Only allow patients to update their own allergies or doctors
    const isPatientOwner = patient.user._id
      ? patient.user._id.toString() === req.user._id.toString()
      : patient.user.toString() === req.user._id.toString();
    const isDoctor = req.user.role === 'DOCTOR';

    if (!isPatientOwner && !isDoctor) {
      throw new ForbiddenError('You can only update your own allergies');
    }

    // Using the actual patient ID from the database, not the parameter
    const actualPatientId = patient._id;

    // Create update object with minimal required fields
    const updatedPatient = await PatientRepo.update({
      _id: actualPatientId,
      allergies: req.body.allergies,
      user: patient.user,
      status: true,
    });

    if (!updatedPatient) {
      throw new NotFoundResponse('Failed to update allergies');
    }

    return new SuccessResponse('Allergies updated successfully', {
      allergies: updatedPatient.allergies,
    }).send(res);
  }),
);

export default router;

import express from 'express';
import { SuccessResponse } from '../../core/ApiResponse';
import PatientRepo from '../../database/repository/PatientRepo';
import { ProtectedRequest } from 'app-request';
import { BadRequestError } from '../../core/ApiError';
import validator from '../../helpers/validator';
import schema from './schema';
import asyncHandler from '../../helpers/asyncHandler';
import authentication from '../../auth/authentication';
import { Types } from 'mongoose';

const router = express.Router();

/*-------------------------------------------------------------------------*/
router.use(authentication);
/*-------------------------------------------------------------------------*/

router.get(
  '/:id',
  validator(schema.patientId),
  asyncHandler(async (req: ProtectedRequest, res) => {
    try {
      // Check if ID is valid ObjectId
      if (!Types.ObjectId.isValid(req.params.id)) {
        throw new BadRequestError('Invalid patient ID format');
      }

      const patientId = new Types.ObjectId(req.params.id);
      console.log('Searching for patient with ID:', patientId.toString());

      // Try to find by direct ID first
      let patient = await PatientRepo.findById(patientId);

      // If not found by ID, try finding by user ID if authenticated user is the patient
      if (!patient && req.user) {
        console.log('Patient not found by ID, trying user ID:', req.user._id);
        patient = await PatientRepo.findByUserId(req.user._id);
      }

      // If still not found and the ID matches the user's ID, try again with the user ID
      if (
        !patient &&
        Types.ObjectId.isValid(req.params.id) &&
        req.user &&
        req.params.id === req.user._id.toString()
      ) {
        console.log('Trying to find patient with user ID directly');
        patient = await PatientRepo.findByUserId(
          new Types.ObjectId(req.params.id),
        );
      }

      console.log('Patient search result:', patient ? 'Found' : 'Not found');

      if (!patient) throw new BadRequestError('Patient not found');
      new SuccessResponse('success', patient).send(res);
    } catch (error) {
      console.error('Error in patient lookup:', error);
      throw error;
    }
  }),
);

// Add a new endpoint that finds patient by user ID explicitly
router.get(
  '/by-user/:userId',
  validator(schema.patientId),
  asyncHandler(async (req: ProtectedRequest, res) => {
    try {
      if (!Types.ObjectId.isValid(req.params.userId)) {
        throw new BadRequestError('Invalid user ID format');
      }

      const userId = new Types.ObjectId(req.params.userId);
      console.log('Searching for patient with user ID:', userId.toString());

      const patient = await PatientRepo.findByUserId(userId);

      if (!patient)
        throw new BadRequestError('Patient not found for this user');
      new SuccessResponse('success', patient).send(res);
    } catch (error) {
      console.error('Error in patient lookup by user ID:', error);
      throw error;
    }
  }),
);

// Add a patient profile route for the authenticated user
router.get(
  '/profile/me',
  asyncHandler(async (req: ProtectedRequest, res) => {
    try {
      if (!req.user || !req.user._id) {
        throw new BadRequestError('User not authenticated');
      }

      console.log(
        'Looking up patient profile for authenticated user:',
        req.user._id,
      );

      const patient = await PatientRepo.findByUserId(req.user._id);

      if (!patient)
        throw new BadRequestError(
          'Patient profile not found for authenticated user',
        );
      new SuccessResponse('success', patient).send(res);
    } catch (error) {
      console.error('Error in patient profile lookup:', error);
      throw error;
    }
  }),
);

export default router;

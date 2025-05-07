import express from 'express';
import { SuccessResponse } from '../../core/ApiResponse';
import PatientRepo from '../../database/repository/PatientRepo';
import { ProtectedRequest } from 'app-request';
import { BadRequestError, ForbiddenError } from '../../core/ApiError';
import validator from '../../helpers/validator';
import schema from './schema';
import asyncHandler from '../../helpers/asyncHandler';
import authentication from '../../auth/authentication';
import { Types } from 'mongoose';
import medicalHistoryRouter from './medicalHistory';
import prescriptionsRouter from './prescriptions';
import appointmentsRouter from './appointments';
import medicalRecordsRouter from './medicalRecords';
import allergiesRouter from './allergies';
import insuranceRouter from './insurance';
import paymentsRouter from './payments';

const router = express.Router();

/*-------------------------------------------------------------------------*/
// Below all routes require authenticated user
/*-------------------------------------------------------------------------*/
router.use(authentication);

// Mount sub-routers
router.use('/:patientId/medical-history', medicalHistoryRouter);
router.use('/:patientId/prescriptions', prescriptionsRouter);
router.use('/:patientId/appointments', appointmentsRouter);
router.use('/:patientId/medical-records', medicalRecordsRouter);
router.use('/:patientId/allergies', allergiesRouter);
router.use('/:patientId/insurance', insuranceRouter);
router.use('/:patientId/payments', paymentsRouter);

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
      console.log('patient.user:', patient.user, 'req.user._id:', req.user._id);
      console.log(
        'patient.user.toString():',
        patient.user.toString(),
        'req.user._id.toString():',
        req.user._id.toString(),
      );
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

// Update patient profile with field-level permissions
router.put(
  '/:id',
  validator(schema.updatePatient),
  asyncHandler(async (req: ProtectedRequest, res) => {
    if (!Types.ObjectId.isValid(req.params.id)) {
      throw new BadRequestError('Invalid patient ID format');
    }

    const patientId = new Types.ObjectId(req.params.id);

    // Check if patient exists
    const patient = await PatientRepo.findById(patientId);
    if (!patient) {
      throw new BadRequestError('Patient not found');
    }

    // Check authorization: only the patient or doctors can access the profile
    const isPatientOwner = patient.user._id
      ? patient.user._id.toString() === req.user._id.toString()
      : patient.user.toString() === req.user._id.toString();
    const isDoctor = req.user.role === 'DOCTOR';

    if (!isPatientOwner && !isDoctor) {
      throw new ForbiddenError('Not authorized to access this patient profile');
    }

    // Field-level permission control
    const updateData: any = {};
    const fieldsPatientCanUpdate = ['height', 'weight', 'allergies'];
    const fieldsOnlyDoctorCanUpdate = ['bloodGroup'];

    // Process each field in the request body
    Object.keys(req.body).forEach((field) => {
      // Fields any authenticated & authorized user can update
      if (fieldsPatientCanUpdate.includes(field)) {
        updateData[field] = req.body[field];
      }
      // Fields only doctors can update
      else if (fieldsOnlyDoctorCanUpdate.includes(field)) {
        if (isDoctor) {
          updateData[field] = req.body[field];
        } else {
          // We don't throw here to allow partial updates - just silently ignore fields the user can't update
          console.log(`Field ${field} requires doctor privileges, skipping`);
        }
      }
      // All other fields - apply standard permission check
      else {
        updateData[field] = req.body[field];
      }
    });

    // Include the ID and user reference
    updateData._id = patientId;
    updateData.user = patient.user;

    // Add metadata for audit trail
    updateData.updatedBy = req.user._id;
    updateData.updatedAt = new Date();

    // Update patient profile with processed fields
    const updatedPatient = await PatientRepo.update(updateData);

    if (!updatedPatient) {
      throw new BadRequestError('Failed to update patient profile');
    }

    new SuccessResponse(
      'Patient profile updated successfully',
      updatedPatient,
    ).send(res);
  }),
);

export default router;

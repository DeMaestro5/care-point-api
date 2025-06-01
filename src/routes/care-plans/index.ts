import express from 'express';
import { SuccessResponse } from '../../core/ApiResponse';
import { ProtectedRequest } from 'app-request';
import { BadRequestError, NotFoundError } from '../../core/ApiError';
import validator from '../../helpers/validator';
import schema from './schema';
import asyncHandler from '../../helpers/asyncHandler';
import authentication from '../../auth/authentication';
import { Types } from 'mongoose';
import CarePlanRepo from '../../database/repository/CarePlanRepo';
import PatientRepo from '../../database/repository/PatientRepo';

const router = express.Router();

/*-------------------------------------------------------------------------*/
// Below all routes require authenticated user
/*-------------------------------------------------------------------------*/
router.use(authentication);

/*-------------------------------------------------------------------------*/
// Create care plan
/*-------------------------------------------------------------------------*/
router.post(
  '/',
  validator(schema.createCarePlan),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const patient = await PatientRepo.findById(
      new Types.ObjectId(req.body.patientId),
    );
    if (!patient) throw new BadRequestError('Patient not found');

    const carePlan = await CarePlanRepo.create({
      ...req.body,
      patientId: new Types.ObjectId(req.body.patientId),
      assignedTo: req.body.assignedTo.map(
        (id: string) => new Types.ObjectId(id),
      ),
    });

    new SuccessResponse('Care plan created successfully', carePlan).send(res);
  }),
);

/*-------------------------------------------------------------------------*/
// Get care plan details
/*-------------------------------------------------------------------------*/
router.get(
  '/:id',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const carePlan = await CarePlanRepo.findById(
      new Types.ObjectId(req.params.id),
    );
    if (!carePlan) throw new BadRequestError('Care plan not found');

    new SuccessResponse('success', carePlan).send(res);
  }),
);

/*-------------------------------------------------------------------------*/
// Update care plan
/*-------------------------------------------------------------------------*/
router.put(
  '/:id',
  validator(schema.updateCarePlan),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const carePlan = await CarePlanRepo.findById(
      new Types.ObjectId(req.params.id),
    );
    if (!carePlan) throw new BadRequestError('Care plan not found');

    const updatedCarePlan = await CarePlanRepo.update(
      new Types.ObjectId(req.params.id),
      {
        ...req.body,
        assignedTo: req.body.assignedTo?.map(
          (id: string) => new Types.ObjectId(id),
        ),
      },
    );

    new SuccessResponse('Care plan updated successfully', updatedCarePlan).send(
      res,
    );
  }),
);

/*-------------------------------------------------------------------------*/
// List patient care plans
/*-------------------------------------------------------------------------*/
router.get(
  '/patient/:id',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const patient = await PatientRepo.findById(
      new Types.ObjectId(req.params.id),
    );
    if (!patient) throw new BadRequestError('Patient not found');

    const carePlans = await CarePlanRepo.findByPatientId(
      new Types.ObjectId(req.params.id),
    );
    if (carePlans.length === 0)
      throw new NotFoundError('Care plans not found for this patient');
    new SuccessResponse('success', carePlans).send(res);
  }),
);

/*-------------------------------------------------------------------------*/
// Track care plan progress
/*-------------------------------------------------------------------------*/
router.get(
  '/:id/progress',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const carePlan = await CarePlanRepo.findById(
      new Types.ObjectId(req.params.id),
    );
    if (!carePlan) throw new BadRequestError('Care plan not found');

    const progress = await CarePlanRepo.calculateProgress(
      new Types.ObjectId(req.params.id),
    );
    new SuccessResponse('success', progress).send(res);
  }),
);

export default router;

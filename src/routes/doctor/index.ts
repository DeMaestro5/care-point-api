import express from 'express';
import { SuccessResponse } from '../../core/ApiResponse';
import DoctorRepo from '../../database/repository/DoctorRepo';
import { ProtectedRequest } from 'app-request';
import { BadRequestError } from '../../core/ApiError';
import validator, { ValidationSource } from '../../helpers/validator';
import schema from './schema';
import asyncHandler from '../../helpers/asyncHandler';
import authentication from '../../auth/authentication';
import { Types } from 'mongoose';
import availabilityRouter from './availability';
import appointmentsRouter from './appointments';
import patientsRouter from './patients';

const router = express.Router();

/*-------------------------------------------------------------------------*/
router.use(authentication);
/*-------------------------------------------------------------------------*/

router.use('/:doctorId/availability', availabilityRouter);
router.use('/:doctorId/appointments', appointmentsRouter);
router.use('/:doctorId/patients', patientsRouter);

router.get(
  '/',
  validator(schema.searchDoctors),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { page, limit, specialization, status, search } = req.query;
    const result = await DoctorRepo.searchDoctors({
      page: Number(page),
      limit: Number(limit),
      specialization: specialization as string,
      status: status === 'true' ? true : status === 'false' ? false : undefined,
      search: search as string,
    });

    new SuccessResponse('success', result).send(res);
  }),
);

router.get(
  '/:id',
  validator(schema.doctorId, ValidationSource.PARAM),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const doctor = await DoctorRepo.findById(new Types.ObjectId(req.params.id));
    if (!doctor) throw new BadRequestError('Doctor not found');
    new SuccessResponse('success', doctor).send(res);
  }),
);

router.put(
  '/:id',
  validator(schema.updateDoctor),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const doctor = await DoctorRepo.findById(new Types.ObjectId(req.params.id));
    if (!doctor) throw new BadRequestError('Doctor not found');

    const updatedDoctor = await DoctorRepo.update({
      _id: doctor._id,
      ...req.body,
    });

    if (!updatedDoctor) throw new BadRequestError('Failed to update doctor');
    new SuccessResponse('Doctor updated successfully', updatedDoctor).send(res);
  }),
);

export default router;

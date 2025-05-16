import express from 'express';
import { Types } from 'mongoose';
import asyncHandler from '../../helpers/asyncHandler';
import { ProtectedRequest } from 'app-request';
import { SuccessResponse } from '../../core/ApiResponse';
import PrescriptionRepo from '../../database/repository/PrescriptionRepo';
import validator from '../../helpers/validator';
import schema from './schema';
import { BadRequestError } from '../../core/ApiError';
import PatientRepo from '../../database/repository/PatientRepo';
import DoctorRepo from '../../database/repository/DoctorRepo';
import PharmacyRepo from '../../database/repository/PharmacyRepo';
import doctorAuth from '../../auth/doctorAuth';
import authentication from '../../auth/authentication';

const router = express.Router();

/*-------------------------------------------------------------------------*/
router.use(authentication);
/*-------------------------------------------------------------------------*/

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

router.post(
  '/',
  validator(schema.createPrescription),
  doctorAuth,
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { patientId, pharmacyId, medications, diagnosis, notes } = req.body;

    console.log('Request body:', {
      patientId,
      pharmacyId,
      authenticatedUserId: req.user._id,
    });

    // Verify patient exists
    const patient = await PatientRepo.findByUserId(
      new Types.ObjectId(patientId),
    );
    if (!patient) throw new BadRequestError('Patient not found');

    // Find doctor by authenticated user's ID
    const doctor = await DoctorRepo.findByUserId(
      new Types.ObjectId(req.user._id),
    );
    console.log('Found doctor:', {
      doctorId: doctor?._id,
      doctorUserId: doctor?.user,
      authenticatedUserId: req.user._id,
    });

    if (!doctor) throw new BadRequestError('Doctor not found');

    // Verify pharmacy exists
    const pharmacy = await PharmacyRepo.findById(
      new Types.ObjectId(pharmacyId),
    );
    if (!pharmacy) throw new BadRequestError('Pharmacy not found');

    const prescription = await PrescriptionRepo.create({
      patient: patient._id,
      doctor: doctor._id,
      pharmacy: pharmacy._id,
      medications,
      diagnosis,
      notes,
      status: 'ACTIVE',
    });

    new SuccessResponse('Prescription created successfully', prescription).send(
      res,
    );
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { id } = req.params;
    const prescription = await PrescriptionRepo.findById(
      new Types.ObjectId(id),
    );
    if (!prescription) throw new BadRequestError('Prescription not found');

    new SuccessResponse('Prescription fetched successfully', prescription).send(
      res,
    );
  }),
);
export default router;

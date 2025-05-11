import express from 'express';
import { Types } from 'mongoose';
import asyncHandler from '../../helpers/asyncHandler';
import { ProtectedRequest } from 'app-request';
import { BadRequestError, NotFoundError } from '../../core/ApiError';
import { SuccessResponse } from '../../core/ApiResponse';
import PrescriptionRepo from '../../database/repository/PrescriptionRepo';
import PharmacyRepo from '../../database/repository/PharmacyRepo';
import validator from '../../helpers/validator';
import schema from './schema';
import DoctorRepo from '../../database/repository/DoctorRepo';
import PatientRepo from '../../database/repository/PatientRepo';
import pharmacyAuth from '../../auth/pharmacyAuth';
import { DoctorModel } from '../../database/model/Doctor';

const router = express.Router({ mergeParams: true });

// Create a new prescription

router.post(
  '/',
  validator(schema.createPrescription),
  pharmacyAuth,
  asyncHandler(async (req: ProtectedRequest, res) => {
    const pharmacyId = new Types.ObjectId(req.params.pharmacyId);
    console.log(pharmacyId);
    const { patientId, doctorId, medications, diagnosis, notes } = req.body;

    // Verify pharmacy exists and belongs to the authenticated user
    const pharmacy = await PharmacyRepo.findById(pharmacyId);
    console.log(pharmacy);
    if (!pharmacy) throw new BadRequestError('Pharmacy not found');

    // Check that the logged-in user is the owner of this pharmacy
    if (pharmacy.user._id.toString() !== req.user._id.toString()) {
      throw new BadRequestError('Unauthorized pharmacy access');
    }

    // Verify patient exists
    const patient = await PatientRepo.findByUserId(
      new Types.ObjectId(patientId),
    );
    if (!patient) throw new BadRequestError('Patient not found');

    // Verify doctor exists
    console.log('Looking up doctor with ID:', doctorId);
    // First check if doctor exists without status filter
    const doctorWithoutStatus = await DoctorModel.findOne({
      _id: new Types.ObjectId(doctorId),
    });
    console.log('Doctor lookup without status filter:', doctorWithoutStatus);

    const doctor = await DoctorRepo.findById(new Types.ObjectId(doctorId));
    console.log('Doctor lookup with status filter:', doctor);
    if (!doctor) throw new BadRequestError('Doctor not found');

    const prescription = await PrescriptionRepo.create({
      patient: patient._id,
      doctor: doctor._id,
      pharmacy: pharmacyId,
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

// List received prescriptions for a pharmacy
router.get(
  '/',
  validator(schema.listPrescriptions),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const pharmacyId = new Types.ObjectId(req.params.pharmacyId);
    const { page = 1, limit = 10, status } = req.query;

    // Verify pharmacy exists
    const pharmacy = await PharmacyRepo.findById(pharmacyId);
    if (!pharmacy) throw new BadRequestError('Pharmacy not found');

    // Get prescriptions with pagination
    const skip = (Number(page) - 1) * Number(limit);
    const filter: any = { status: { $ne: 'CANCELLED' } };
    if (status) filter.status = status;

    const prescriptions = await PrescriptionRepo.findByPharmacyId(
      pharmacyId,
      filter,
      Number(skip),
      Number(limit),
    );

    if (prescriptions.length === 0)
      throw new BadRequestError('No prescriptions found');

    const total = await PrescriptionRepo.countByPharmacyId(pharmacyId, filter);

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

// Update prescription status
router.put(
  '/:rxId',
  validator(schema.updatePrescriptionStatus),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const pharmacyId = new Types.ObjectId(req.params.pharmacyId);
    const prescriptionId = new Types.ObjectId(req.params.rxId);

    // Verify pharmacy exists
    const pharmacy = await PharmacyRepo.findById(pharmacyId);
    if (!pharmacy) throw new BadRequestError('Pharmacy not found');

    // Verify prescription exists and belongs to pharmacy
    const prescription = await PrescriptionRepo.findById(prescriptionId);
    if (!prescription) throw new NotFoundError('Prescription not found');
    if (!prescription.pharmacy || !prescription.pharmacy.equals(pharmacyId)) {
      throw new BadRequestError(
        'Prescription does not belong to this pharmacy',
      );
    }

    const updatedPrescription = await PrescriptionRepo.update(prescriptionId, {
      status: req.body.status,
    });

    new SuccessResponse(
      'Prescription status updated successfully',
      updatedPrescription,
    ).send(res);
  }),
);

export default router;

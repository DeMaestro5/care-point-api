import express from 'express';
import { Types } from 'mongoose';
import asyncHandler from '../../helpers/asyncHandler';
import { ProtectedRequest } from 'app-request';
import { BadRequestError } from '../../core/ApiError';
import { SuccessResponse } from '../../core/ApiResponse';
import MedicationRepo from '../../database/repository/MedicationRepo';
import validator from '../../helpers/validator';
import schema from './schema';
import authentication from '../../auth/authentication';
import pharmacyAuth from '../../auth/pharmacyAuth';
import InventoryRepo from '../../database/repository/InventoryRepo';
import PharmacyRepo from '../../database/repository/PharmacyRepo';

const router = express.Router();

/*-------------------------------------------------------------------------*/
// Below all routes require authenticated user
/*-------------------------------------------------------------------------*/
router.use(authentication);

// Get all medications
router.get(
  '/',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { query = '', page = 1, limit = 10 } = req.query;

    const medications = await MedicationRepo.search(
      query as string,
      Number(page),
      Number(limit),
    );

    new SuccessResponse('Medications retrieved successfully', medications).send(
      res,
    );
  }),
);

// Create new medication
router.post(
  '/',
  validator(schema.createMedication),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const {
      name,
      genericName,
      description,
      category,
      unit,
      manufacturer,
      dosageForm,
      strength,
      prescriptionRequired,
      sideEffects,
      contraindications,
      storageInstructions,
    } = req.body;

    // Check if medication with same name and strength already exists
    const existingMedication = await MedicationRepo.findByNameAndStrength(
      name,
      strength,
    );

    if (existingMedication) {
      throw new BadRequestError(
        'Medication with this name and strength already exists',
      );
    }

    const medication = await MedicationRepo.create({
      name,
      genericName,
      description,
      category,
      unit,
      manufacturer,
      dosageForm,
      strength,
      prescriptionRequired: prescriptionRequired || false,
      sideEffects: sideEffects || [],
      contraindications: contraindications || [],
      storageInstructions,
      status: true,
    });

    new SuccessResponse('Medication created successfully', medication).send(
      res,
    );
  }),
);

// Get medication alternatives
router.get(
  '/:id/alternatives',
  validator(schema.getAlternatives),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const medication = await MedicationRepo.findById(
      new Types.ObjectId(req.params.id),
    );

    if (!medication) {
      throw new BadRequestError('Medication not found');
    }

    // Find alternative medications in the same category
    const alternatives = await MedicationRepo.search(
      medication.category,
      1,
      10,
    );

    new SuccessResponse('success', {
      medication,
      alternatives: alternatives.medications.filter(
        (alt) => alt._id.toString() !== medication._id.toString(),
      ),
    }).send(res);
  }),
);

// Get medication interactions
router.get(
  '/:id/interactions',
  validator(schema.getInteractions),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const medication = await MedicationRepo.findById(
      new Types.ObjectId(req.params.id),
    );

    if (!medication) {
      throw new BadRequestError('Medication not found');
    }

    // TODO: Implement actual drug interaction checking logic
    // This is a placeholder response
    new SuccessResponse('success', {
      medication,
      interactions: {
        severity: 'MODERATE',
        interactions: [
          {
            medication: 'Example Drug',
            description: 'May increase risk of side effects',
            severity: 'MODERATE',
          },
        ],
      },
    }).send(res);
  }),
);

// Get medication categories
router.get(
  '/categories',
  validator(schema.getCategories),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const categories = await MedicationRepo.getCategories();
    new SuccessResponse('success', { categories }).send(res);
  }),
);

// Get medication availability across pharmacies
router.get(
  '/:id/availability',
  validator(schema.getAvailability),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const medication = await MedicationRepo.findById(
      new Types.ObjectId(req.params.id),
    );

    if (!medication) {
      throw new BadRequestError('Medication not found');
    }

    const availability = await InventoryRepo.findByMedicationId(
      new Types.ObjectId(req.params.id),
    );

    new SuccessResponse('success', {
      medication,
      availability,
    }).send(res);
  }),
);

// Batch inventory update for pharmacy
router.post(
  '/pharmacies/:id/inventory/batch',
  validator(schema.batchInventoryUpdate),
  pharmacyAuth,
  asyncHandler(async (req: ProtectedRequest, res) => {
    const pharmacyId = new Types.ObjectId(req.params.id);
    const { updates } = req.body;

    // Verify pharmacy exists and belongs to the authenticated user
    const pharmacy = await PharmacyRepo.findById(pharmacyId);
    if (!pharmacy) {
      throw new BadRequestError('Pharmacy not found');
    }

    // Check that the logged-in user is the owner of this pharmacy
    if (pharmacy.user._id.toString() !== req.user._id.toString()) {
      throw new BadRequestError('Unauthorized pharmacy access');
    }

    const results = await InventoryRepo.batchUpdate(pharmacyId, updates);

    new SuccessResponse('Inventory updated successfully', results).send(res);
  }),
);

export default router;

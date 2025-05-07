import { Router } from 'express';
import { Types } from 'mongoose';
import { BadRequestError } from '../../core/ApiError';
import { NotFoundResponse, SuccessResponse } from '../../core/ApiResponse';
import asyncHandler from '../../helpers/asyncHandler';
import FamilyMemberRepo from '../../database/repository/FamilyMemberRepo';

const router = Router({ mergeParams: true });

/**
 * @route   GET /api/patients/:patientId/family-members
 * @desc    Get patient's family members
 * @access  Private
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const patientId = new Types.ObjectId(req.params.patientId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (page < 1)
      throw new BadRequestError('Page number must be greater than 0');
    if (limit < 1) throw new BadRequestError('Limit must be greater than 0');

    const { familyMembers, total } = await FamilyMemberRepo.findByPatientId(
      patientId,
      page,
      limit,
    );

    if (familyMembers.length === 0) {
      return new NotFoundResponse('No family members found').send(res);
    }

    return new SuccessResponse('Family members retrieved successfully', {
      patientId,
      familyMembers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }).send(res);
  }),
);

/**
 * @route   POST /api/patients/:patientId/family-members
 * @desc    Add a new family member
 * @access  Private
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const patientId = new Types.ObjectId(req.params.patientId);
    const {
      name,
      relationship,
      dateOfBirth,
      gender,
      phoneNumber,
      email,
      address,
      isEmergencyContact,
    } = req.body;

    if (!name || !relationship) {
      throw new BadRequestError('Name and relationship are required');
    }

    const familyMember = await FamilyMemberRepo.create({
      patientId,
      name,
      relationship,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender,
      phoneNumber,
      email,
      address,
      isEmergencyContact,
    });

    return new SuccessResponse('Family member added successfully', {
      familyMember,
    }).send(res);
  }),
);

export default router;

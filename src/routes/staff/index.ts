import express from 'express';
import { SuccessResponse } from '../../core/ApiResponse';
import StaffRepo from '../../database/repository/StaffRepo';
import StaffRoleRepo from '../../database/repository/StaffRoleRepo';
import { ProtectedRequest } from 'app-request';
import { BadRequestError, ForbiddenError } from '../../core/ApiError';
import validator from '../../helpers/validator';
import schema from './schema';
import asyncHandler from '../../helpers/asyncHandler';
import authentication from '../../auth/authentication';
import { Types } from 'mongoose';
import adminAuth from '../../auth/adminAuth';

const router = express.Router();

/*-------------------------------------------------------------------------*/
// Below all routes require authenticated user
/*-------------------------------------------------------------------------*/
router.use(authentication);

// GET /api/staff - List staff members
router.get(
  '/',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { page, limit, role, department, status, search } = req.query;
    const result = await StaffRepo.searchStaff({
      page: Number(page),
      limit: Number(limit),
      role: role as any,
      department: department as string,
      status: status === 'true' ? true : status === 'false' ? false : undefined,
      search: search as string,
    });

    new SuccessResponse('success', result).send(res);
  }),
);

// POST /api/staff - Add staff member
router.post(
  '/',
  validator(schema.createStaff),
  asyncHandler(async (req: ProtectedRequest, res) => {
    // Check if user with the provided ID exists and doesn't already have a staff profile
    const existingStaff = await StaffRepo.findByUserId(
      new Types.ObjectId(req.body.user),
    );
    if (existingStaff) {
      throw new BadRequestError('User already has a staff profile');
    }

    const staffData = {
      ...req.body,
      user: new Types.ObjectId(req.body.user),
    };

    const newStaff = await StaffRepo.create(staffData);
    new SuccessResponse('Staff member added successfully', newStaff).send(res);
  }),
);

// GET /api/staff/{id} - Get single staff member (implicit from list route structure)
router.get(
  '/:id',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const staff = await StaffRepo.findById(new Types.ObjectId(req.params.id));
    if (!staff) throw new BadRequestError('Staff member not found');
    new SuccessResponse('success', staff).send(res);
  }),
);

// PUT /api/staff/{id} - Update staff information
router.put(
  '/:id',
  validator(schema.updateStaff),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const staff = await StaffRepo.findById(new Types.ObjectId(req.params.id));
    if (!staff) throw new BadRequestError('Staff member not found');

    // Authorization check - only allow admins or the staff member themselves to update
    const isStaffOwner = staff.user._id
      ? staff.user._id.toString() === req.user._id.toString()
      : staff.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isStaffOwner && !isAdmin) {
      throw new ForbiddenError('Not authorized to update this staff profile');
    }

    const updatedStaff = await StaffRepo.update({
      _id: staff._id,
      user: staff.user,
      ...req.body,
    });

    if (!updatedStaff)
      throw new BadRequestError('Failed to update staff member');
    new SuccessResponse('Staff member updated successfully', updatedStaff).send(
      res,
    );
  }),
);

// GET /api/staff/{id}/schedule - Get staff schedule
router.get(
  '/:id/schedule',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const staff = await StaffRepo.findById(new Types.ObjectId(req.params.id));
    if (!staff) throw new BadRequestError('Staff member not found');

    new SuccessResponse('success', {
      staffId: staff._id,
      schedule: staff.schedule || {},
    }).send(res);
  }),
);

// PUT /api/staff/{id}/schedule - Update staff schedule
router.put(
  '/:id/schedule',
  validator(schema.updateSchedule),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const staff = await StaffRepo.findById(new Types.ObjectId(req.params.id));
    if (!staff) throw new BadRequestError('Staff member not found');

    // Authorization check - only allow admins or the staff member themselves to update schedule
    const isStaffOwner = staff.user._id
      ? staff.user._id.toString() === req.user._id.toString()
      : staff.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isStaffOwner && !isAdmin) {
      throw new ForbiddenError('Not authorized to update this staff schedule');
    }

    const updatedStaff = await StaffRepo.updateSchedule(
      staff._id,
      req.body.schedule,
    );

    if (!updatedStaff)
      throw new BadRequestError('Failed to update staff schedule');
    new SuccessResponse('Staff schedule updated successfully', {
      staffId: updatedStaff._id,
      schedule: updatedStaff.schedule,
    }).send(res);
  }),
);

// POST /api/staff/roles - Create staff role
router.post(
  '/roles',
  adminAuth,
  validator(schema.createRole),
  asyncHandler(async (req: ProtectedRequest, res) => {
    // Check if role with same name already exists
    const existingRole = await StaffRoleRepo.findByName(req.body.name);
    if (existingRole) {
      throw new BadRequestError('Role with this name already exists');
    }

    const newRole = await StaffRoleRepo.create(req.body);
    new SuccessResponse('Staff role created successfully', newRole).send(res);
  }),
);

// GET /api/staff/roles - List available roles
router.get(
  '/roles',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const roles = await StaffRoleRepo.findAll();
    new SuccessResponse('success', { roles }).send(res);
  }),
);

export default router;

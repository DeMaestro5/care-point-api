import express from 'express';
import { SuccessResponse } from '../../core/ApiResponse';
import { RoleRequest } from '../../types/app-request.d';
import validator from '../../helpers/validator';
import schema from './schema';
import asyncHandler from '../../helpers/asyncHandler';
import { RoleCode } from '../../database/model/Role';
import { AuthService } from '../../services';

const router = express.Router();

// Admin signup endpoint
router.post(
  '/admin',
  validator(schema.adminSignup),
  asyncHandler(async (req: RoleRequest, res) => {
    const authResponse = await AuthService.signup({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      profilePicUrl: req.body.profilePicUrl,
      role: RoleCode.ADMIN,
    });

    new SuccessResponse('Admin Signup Successful', {
      user: {
        ...authResponse.user,
        role: authResponse.user.role,
      },
      tokens: authResponse.tokens,
    }).send(res);
  }),
);

router.post(
  '/basic',
  validator(schema.signup),
  asyncHandler(async (req: RoleRequest, res) => {
    const authResponse = await AuthService.signup({
      ...req.body,
      role: req.body.role,
    });

    new SuccessResponse('Signup Successful', {
      user: {
        ...authResponse.user,
        role: authResponse.user.role,
        ...authResponse.profileData,
      },
      tokens: authResponse.tokens,
    }).send(res);
  }),
);

export default router;

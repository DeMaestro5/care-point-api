import express from 'express';
import { SuccessResponse } from '../../core/ApiResponse';
import validator from '../../helpers/validator';
import schema from './schema';
import asyncHandler from '../../helpers/asyncHandler';
import { PublicRequest } from '../../types/app-request';
import { AuthService } from '../../services';

const router = express.Router();

router.post(
  '/',
  validator(schema.credential),
  asyncHandler(async (req: PublicRequest, res) => {
    const { email, password } = req.body;

    const authResponse = await AuthService.login({
      email,
      password,
    });

    new SuccessResponse('Login Success', {
      user: {
        ...authResponse.user,
        role: authResponse.user.role,
      },
      tokens: authResponse.tokens,
    }).send(res);
  }),
);

export default router;

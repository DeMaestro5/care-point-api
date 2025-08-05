import express from 'express';
import { TokenRefreshResponse } from '../../core/ApiResponse';
import { ProtectedRequest } from 'app-request';
import { getAccessToken } from '../../auth/authUtils';
import validator, { ValidationSource } from '../../helpers/validator';
import schema from './schema';
import asyncHandler from '../../helpers/asyncHandler';
import { AuthService } from '../../services';

const router = express.Router();

router.post(
  '/refresh',
  validator(schema.auth, ValidationSource.HEADER),
  validator(schema.refreshToken),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const accessToken = getAccessToken(req.headers.authorization);
    const { refreshToken } = req.body;

    const tokens = await AuthService.refreshToken(accessToken, refreshToken);

    new TokenRefreshResponse(
      'Token Issued',
      tokens.accessToken,
      tokens.refreshToken,
    ).send(res);
  }),
);

export default router;

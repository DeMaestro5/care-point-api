import express from 'express';
import { ProtectedRequest } from 'app-request';
import { AuthFailureError } from '../core/ApiError';
import RoleRepo from '../database/repository/RoleRepo';
import asyncHandler from '../helpers/asyncHandler';
import { NextFunction, Request, Response } from 'express';
import { ForbiddenError } from '../core/ApiError';

const router = express.Router();

export default (roleCode: string) =>
  async (req: ProtectedRequest, res: Response, next: NextFunction) => {
    try {
      const role = await RoleRepo.findByCode(roleCode);
      if (!role) throw new ForbiddenError('Permission denied');

      if (req.user.role !== roleCode) {
        throw new ForbiddenError('Permission denied');
      }

      next();
    } catch (error) {
      next(error);
    }
  };

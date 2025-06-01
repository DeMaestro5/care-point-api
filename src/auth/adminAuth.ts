import { Response, NextFunction } from 'express';
import { ProtectedRequest } from '../types/app-request';
import { RoleCode } from '../database/model/Role';
import { ForbiddenResponse } from '../core/ApiResponse';

export default async function adminAuth(
  req: ProtectedRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.user || req.user.role !== RoleCode.ADMIN) {
    throw new ForbiddenResponse('Only admins can perform this action').send(
      res,
    );
  }
  next();
}

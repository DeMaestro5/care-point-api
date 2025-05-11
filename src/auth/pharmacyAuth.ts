import { Response, NextFunction } from 'express';
import { ProtectedRequest } from 'app-request';
import { ForbiddenResponse } from '../core/ApiResponse';

export default (req: ProtectedRequest, res: Response, next: NextFunction) => {
  if (req.user.role !== 'PHARMACY') {
    return new ForbiddenResponse(
      'Only pharmacies can perform this action',
    ).send(res);
  }
  next();
};

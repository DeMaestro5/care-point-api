import { Response, NextFunction } from 'express';
import { ProtectedRequest } from 'app-request';
import { ForbiddenResponse } from '../core/ApiResponse';

export default (req: ProtectedRequest, res: Response, next: NextFunction) => {
  if (req.user.role !== 'DOCTOR') {
    return new ForbiddenResponse('Only doctors can perform this action').send(
      res,
    );
  }
  next();
};

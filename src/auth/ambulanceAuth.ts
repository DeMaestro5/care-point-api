import { Response, NextFunction } from 'express';
import { ProtectedRequest } from 'app-request';
import { ForbiddenResponse } from '../core/ApiResponse';

export default (req: ProtectedRequest, res: Response, next: NextFunction) => {
  if (req.user.role !== 'AMBULANCE') {
    return new ForbiddenResponse(
      'Only ambulance services can perform this action',
    ).send(res);
  }
  next();
};

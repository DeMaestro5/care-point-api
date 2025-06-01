import express from 'express';
import { SuccessResponse } from '../../core/ApiResponse';
import { ProtectedRequest } from '../../types/app-request';
import asyncHandler from '../../helpers/asyncHandler';
import authentication from '../../auth/authentication';
import adminAuth from '../../auth/adminAuth';
import AuditLogRepo from '../../database/repository/AuditLogRepo';
import validator from '../../helpers/validator';
import schema from './schema';

const router = express.Router();

/*-------------------------------------------------------------------------*/
// Below all routes require authenticated admin user
/*-------------------------------------------------------------------------*/
router.use(authentication);
router.use(adminAuth);

// Get audit logs with pagination and filters
router.get(
  '/',
  validator(schema.getAuditLogs),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { page = 1, limit = 10, ...filters } = req.query;
    const { logs, total } = await AuditLogRepo.findAll(
      Number(page),
      Number(limit),
      filters,
    );

    new SuccessResponse('Audit logs retrieved successfully', {
      logs,
      total,
      page: Number(page),
      limit: Number(limit),
    }).send(res);
  }),
);

export default router;

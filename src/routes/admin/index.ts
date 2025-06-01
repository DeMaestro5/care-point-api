import express from 'express';
import auditLogsRouter from './audit-logs';
import systemStatsRouter from './system-stats';
import bulkOperationsRouter from './bulk-operations';

const router = express.Router();

router.use('/audit-logs', auditLogsRouter);
router.use('/system/stats', systemStatsRouter);
router.use('/bulk-operations', bulkOperationsRouter);

export default router;

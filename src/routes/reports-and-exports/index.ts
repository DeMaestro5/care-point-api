import express from 'express';
import { SuccessResponse } from '../../core/ApiResponse';
import { ProtectedRequest } from 'app-request';
import validator from '../../helpers/validator';
import schema from './schema';
import asyncHandler from '../../helpers/asyncHandler';
import authentication from '../../auth/authentication';
import ReportsAndExportsService from '../../services/ReportsAndExportsService';

const router = express.Router();

/*-------------------------------------------------------------------------*/
// Below all routes require authenticated user
/*-------------------------------------------------------------------------*/
router.use(authentication);

// POST /api/reports/generate - Generate custom report
router.post(
  '/generate',
  validator(schema.generateReport),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const reportData = req.body;

    const report = await ReportsAndExportsService.generateReport(reportData);

    new SuccessResponse(
      'Report generation initiated successfully',
      report,
    ).send(res);
  }),
);

// GET /api/reports/templates - List report templates
router.get(
  '/templates',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const templates = ReportsAndExportsService.getTemplates();

    new SuccessResponse(
      'Report templates retrieved successfully',
      templates,
    ).send(res);
  }),
);

// GET /api/exports/appointments - Export appointments data
router.get(
  '/exports/appointments',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const filters: any = {};

    if (req.query.status) filters.status = req.query.status as string;
    if (req.query.doctorId) filters.doctorId = req.query.doctorId as string;
    if (req.query.patientId) filters.patientId = req.query.patientId as string;

    const params = {
      format: (req.query.format as 'csv' | 'excel' | 'json') || 'csv',
      dateRange:
        req.query.startDate && req.query.endDate
          ? {
              startDate: new Date(req.query.startDate as string),
              endDate: new Date(req.query.endDate as string),
            }
          : undefined,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 1000,
    };

    const exportResult =
      await ReportsAndExportsService.exportAppointments(params);

    res.setHeader('Content-Type', exportResult.contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${exportResult.filename}"`,
    );
    res.send(exportResult.data);
  }),
);

// GET /api/exports/patients - Export patient data
router.get(
  '/exports/patients',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const filters: any = {};

    if (req.query.status) filters.status = req.query.status as string;

    const params = {
      format: (req.query.format as 'csv' | 'excel' | 'json') || 'csv',
      dateRange:
        req.query.startDate && req.query.endDate
          ? {
              startDate: new Date(req.query.startDate as string),
              endDate: new Date(req.query.endDate as string),
            }
          : undefined,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 1000,
    };

    const exportResult = await ReportsAndExportsService.exportPatients(params);

    res.setHeader('Content-Type', exportResult.contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${exportResult.filename}"`,
    );
    res.send(exportResult.data);
  }),
);

// GET /api/exports/inventory - Export inventory data
router.get(
  '/exports/inventory',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const filters: any = {};

    if (req.query.pharmacyId)
      filters.pharmacyId = req.query.pharmacyId as string;

    const params = {
      format: (req.query.format as 'csv' | 'excel' | 'json') || 'csv',
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 1000,
    };

    const exportResult = await ReportsAndExportsService.exportInventory(params);

    res.setHeader('Content-Type', exportResult.contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${exportResult.filename}"`,
    );
    res.send(exportResult.data);
  }),
);

// GET /api/exports/sales - Export sales data
router.get(
  '/exports/sales',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const filters: any = {};

    if (req.query.status) filters.status = req.query.status as string;
    if (req.query.pharmacyId)
      filters.pharmacyId = req.query.pharmacyId as string;

    const params = {
      format: (req.query.format as 'csv' | 'excel' | 'json') || 'csv',
      dateRange:
        req.query.startDate && req.query.endDate
          ? {
              startDate: new Date(req.query.startDate as string),
              endDate: new Date(req.query.endDate as string),
            }
          : undefined,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 1000,
    };

    const exportResult = await ReportsAndExportsService.exportSales(params);

    res.setHeader('Content-Type', exportResult.contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${exportResult.filename}"`,
    );
    res.send(exportResult.data);
  }),
);

export default router;

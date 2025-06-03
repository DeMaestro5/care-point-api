import express from 'express';
import { SuccessResponse } from '../../core/ApiResponse';
import { BadRequestError, InternalError } from '../../core/ApiError';
import validator from '../../helpers/validator';
import schema from './schema';
import asyncHandler from '../../helpers/asyncHandler';
import authentication from '../../auth/authentication';
import { Types } from 'mongoose';
import SystemSettingsRepo from '../../database/repository/SystemSettingsRepo';
import OperationalHoursRepo from '../../database/repository/OperationalHoursRepo';
import HolidayRepo from '../../database/repository/HolidayRepo';
import { ProtectedRequest } from 'app-request';

const router = express.Router();

/*-------------------------------------------------------------------------*/
// Below all routes require authenticated user
/*-------------------------------------------------------------------------*/
router.use(authentication);

/*-------------------------------------------------------------------------*/
// System Settings Routes
/*-------------------------------------------------------------------------*/

// GET /api/settings/{category} - Get system settings
router.get(
  '/settings/:category',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { category } = req.params;

    const settings = await SystemSettingsRepo.getOrCreate(category);

    // Convert Map to Object for JSON serialization
    const settingsObject = {
      category: settings.category,
      settings:
        settings.settings instanceof Map
          ? Object.fromEntries(settings.settings)
          : settings.settings || {},
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };

    new SuccessResponse('Settings retrieved successfully', settingsObject).send(
      res,
    );
  }),
);

// PUT /api/settings/{category} - Update system settings
router.put(
  '/settings/:category',
  validator(schema.updateSettings),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { category } = req.params;
    const { settings } = req.body;

    const updatedSettings = await SystemSettingsRepo.updateByCategory(
      category,
      settings,
    );

    if (!updatedSettings) {
      throw new InternalError('Failed to update settings');
    }

    // Convert Map to Object for JSON serialization
    const settingsObject = {
      category: updatedSettings.category,
      settings:
        updatedSettings.settings instanceof Map
          ? Object.fromEntries(updatedSettings.settings)
          : updatedSettings.settings || {},
      createdAt: updatedSettings.createdAt,
      updatedAt: updatedSettings.updatedAt,
    };

    new SuccessResponse('Settings updated successfully', settingsObject).send(
      res,
    );
  }),
);

/*-------------------------------------------------------------------------*/
// Operational Hours Routes
/*-------------------------------------------------------------------------*/

// GET /api/system/operational-hours - Get operational hours
router.get(
  '/system/operational-hours',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const operationalHours = await OperationalHoursRepo.getOrCreate();

    new SuccessResponse(
      'Operational hours retrieved successfully',
      operationalHours,
    ).send(res);
  }),
);

// PUT /api/system/operational-hours - Update operational hours
router.put(
  '/system/operational-hours',
  validator(schema.updateOperationalHours),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const operationalHoursData = req.body;

    const updatedHours =
      await OperationalHoursRepo.update(operationalHoursData);

    if (!updatedHours) {
      throw new InternalError('Failed to update operational hours');
    }

    new SuccessResponse(
      'Operational hours updated successfully',
      updatedHours,
    ).send(res);
  }),
);

/*-------------------------------------------------------------------------*/
// Holidays Routes
/*-------------------------------------------------------------------------*/

// GET /api/system/holidays - Get holiday schedule
router.get(
  '/system/holidays',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { year, month, type, upcoming, limit } = req.query;

    let holidays;

    if (upcoming === 'true') {
      holidays = await HolidayRepo.findUpcoming(
        new Date(),
        Number(limit) || 10,
      );
    } else if (year && month !== undefined) {
      holidays = await HolidayRepo.getHolidaysInMonth(
        Number(year),
        Number(month),
      );
    } else if (year) {
      holidays = await HolidayRepo.getHolidaysInYear(Number(year));
    } else if (type) {
      holidays = await HolidayRepo.findByType(type as any);
    } else {
      holidays = await HolidayRepo.findAll();
    }

    new SuccessResponse('Holidays retrieved successfully', holidays).send(res);
  }),
);

// PUT /api/system/holidays - Update holiday schedule (bulk update)
router.put(
  '/system/holidays',
  validator(schema.bulkHolidays),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { holidays } = req.body;

    // Clear existing holidays and create new ones
    // Note: In a production environment, you might want to implement a more sophisticated update strategy
    const createdHolidays = [];

    for (const holidayData of holidays) {
      const holiday = await HolidayRepo.create(holidayData);
      createdHolidays.push(holiday);
    }

    new SuccessResponse('Holidays updated successfully', createdHolidays).send(
      res,
    );
  }),
);

// POST /api/system/holidays - Create a new holiday
router.post(
  '/system/holidays',
  validator(schema.createHoliday),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const holidayData = req.body;

    const holiday = await HolidayRepo.create(holidayData);

    new SuccessResponse('Holiday created successfully', holiday).send(res);
  }),
);

// GET /api/system/holidays/{id} - Get specific holiday
router.get(
  '/system/holidays/:id',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid holiday ID format');
    }

    const holiday = await HolidayRepo.findById(new Types.ObjectId(id));

    if (!holiday) {
      throw new BadRequestError('Holiday not found');
    }

    new SuccessResponse('Holiday retrieved successfully', holiday).send(res);
  }),
);

// PUT /api/system/holidays/{id} - Update specific holiday
router.put(
  '/system/holidays/:id',
  validator(schema.updateHoliday),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { id } = req.params;
    const updateData = req.body;

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid holiday ID format');
    }

    const holiday = await HolidayRepo.update(
      new Types.ObjectId(id),
      updateData,
    );

    if (!holiday) {
      throw new BadRequestError('Holiday not found or failed to update');
    }

    new SuccessResponse('Holiday updated successfully', holiday).send(res);
  }),
);

// DELETE /api/system/holidays/{id} - Delete specific holiday
router.delete(
  '/system/holidays/:id',
  validator(schema.holidayId),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid holiday ID format');
    }

    const deleted = await HolidayRepo.delete(new Types.ObjectId(id));

    if (!deleted) {
      throw new BadRequestError('Holiday not found');
    }

    new SuccessResponse('Holiday deleted successfully', { deleted: true }).send(
      res,
    );
  }),
);

// GET /api/system/holidays/check/{date} - Check if specific date is a holiday
router.get(
  '/system/holidays/check/:date',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { date } = req.params;

    const checkDate = new Date(date);
    if (isNaN(checkDate.getTime())) {
      throw new BadRequestError('Invalid date format');
    }

    const result = await HolidayRepo.isHoliday(checkDate);

    new SuccessResponse('Holiday check completed', result).send(res);
  }),
);

export default router;

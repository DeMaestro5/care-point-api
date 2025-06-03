import express from 'express';
import { SuccessResponse } from '../../core/ApiResponse';
import { BadRequestError, NotFoundError } from '../../core/ApiError';
import asyncHandler from '../../helpers/asyncHandler';
import { ProtectedRequest } from '../../types/app-request';
import CalendarEventRepo from '../../database/repository/CalendarEventRepo';
import { Types } from 'mongoose';
import validator from '../../helpers/validator';
import schema from './schema';
import authentication from '../../auth/authentication';

const router = express.Router();

router.use(authentication);

// GET /api/calendar/availability - Check availability across providers
router.get(
  '/availability',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { userIds, startDate, endDate } = req.query;

    // Handle userIds which can be a string or array of strings from query params
    let userIdArray: string[] = [];

    if (typeof userIds === 'string') {
      // Single userIds parameter or comma-separated
      userIdArray = userIds.includes(',') ? userIds.split(',') : [userIds];
    } else if (Array.isArray(userIds)) {
      // Multiple userIds parameters
      userIdArray = userIds as string[];
    } else {
      throw new BadRequestError('userIds parameter is required');
    }

    // Validate that we have at least one user ID
    if (userIdArray.length === 0) {
      throw new BadRequestError('At least one user ID is required');
    }

    // Validate each user ID format
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    for (const id of userIdArray) {
      if (!objectIdRegex.test(id.trim())) {
        throw new BadRequestError(`Invalid user ID format: ${id}`);
      }
    }

    const userObjectIds = userIdArray.map(
      (id) => new Types.ObjectId(id.trim()),
    );
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    const availability = await CalendarEventRepo.checkAvailability(
      userObjectIds,
      start,
      end,
    );

    return new SuccessResponse('Availability check completed successfully', {
      timeSlot: {
        startDate: start,
        endDate: end,
      },
      availability,
    }).send(res);
  }),
);

// GET /api/calendar/events - List calendar events
router.get(
  '/events',
  validator(schema.listEvents),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      eventType,
      status,
      organizerId,
    } = req.query;

    // Build filter object
    const filter: any = {};

    // Users can only see events they organize or are invited to
    if (req.user.role !== 'ADMIN') {
      filter.$or = [{ organizer: req.user._id }, { attendees: req.user._id }];
    }

    if (eventType) {
      filter.eventType = eventType;
    }

    if (status) {
      filter.status = status;
    }

    if (organizerId) {
      filter.organizer = new Types.ObjectId(organizerId as string);
    }

    if (startDate || endDate) {
      filter.$and = filter.$and || [];
      const dateFilter: any = {};

      if (startDate) {
        dateFilter.$gte = new Date(startDate as string);
      }

      if (endDate) {
        dateFilter.$lte = new Date(endDate as string);
      }

      filter.$and.push({ startDate: dateFilter });
    }

    const { events, total } = await CalendarEventRepo.findByFilter(filter, {
      page: Number(page),
      limit: Number(limit),
      sort: { startDate: 1 },
    });

    return new SuccessResponse('Calendar events retrieved successfully', {
      events,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    }).send(res);
  }),
);

// POST /api/calendar/events - Create calendar event
router.post(
  '/events',
  validator(schema.createEvent),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const eventData = {
      ...req.body,
      organizer: req.user._id,
    };

    const event = await CalendarEventRepo.create(eventData);

    return new SuccessResponse('Calendar event created successfully', {
      event,
    }).send(res);
  }),
);

// PUT /api/calendar/events/{id} - Update calendar event
router.put(
  '/events/:eventId',
  validator(schema.updateEvent),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { eventId } = req.params;
    const eventObjectId = new Types.ObjectId(eventId);

    // Check if event exists and user has permission
    const existingEvent = await CalendarEventRepo.findById(eventObjectId);
    if (!existingEvent) {
      throw new NotFoundError('Calendar event not found');
    }

    // Only organizer or admin can update the event
    if (
      existingEvent.organizer._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'ADMIN'
    ) {
      throw new BadRequestError('You can only update events you organized');
    }

    const updatedEvent = await CalendarEventRepo.update(
      eventObjectId,
      req.body,
    );

    if (!updatedEvent) {
      throw new BadRequestError('Failed to update calendar event');
    }

    return new SuccessResponse('Calendar event updated successfully', {
      event: updatedEvent,
    }).send(res);
  }),
);

// DELETE /api/calendar/events/{id} - Delete calendar event
router.delete(
  '/events/:eventId',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { eventId } = req.params;
    const eventObjectId = new Types.ObjectId(eventId);

    // Check if event exists and user has permission
    const existingEvent = await CalendarEventRepo.findById(eventObjectId);
    if (!existingEvent) {
      throw new NotFoundError('Calendar event not found');
    }

    // Only organizer or admin can delete the event
    if (
      existingEvent.organizer._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'ADMIN'
    ) {
      throw new BadRequestError('You can only delete events you organized');
    }

    const deletedEvent = await CalendarEventRepo.deleteById(eventObjectId);

    return new SuccessResponse('Calendar event deleted successfully', {
      event: deletedEvent,
    }).send(res);
  }),
);

// GET /api/calendar/{userId} - Get user's calendar
router.get(
  '/:userId',
  validator(schema.getUserCalendar),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { userId } = req.params;
    const { startDate, endDate, eventType, status } = req.query;

    // Security check - users can only view their own calendar or if they have admin privileges
    if (req.user._id.toString() !== userId && req.user.role !== 'ADMIN') {
      throw new BadRequestError('You can only access your own calendar');
    }

    const userObjectId = new Types.ObjectId(userId);
    let start: Date | undefined;
    let end: Date | undefined;

    if (startDate) {
      start = new Date(startDate as string);
    }
    if (endDate) {
      end = new Date(endDate as string);
    }

    let events = await CalendarEventRepo.findByUserId(userObjectId, start, end);

    // Apply additional filters
    if (eventType) {
      events = events.filter((event) => event.eventType === eventType);
    }
    if (status) {
      events = events.filter((event) => event.status === status);
    }

    return new SuccessResponse('User calendar retrieved successfully', {
      userId,
      events,
      totalEvents: events.length,
    }).send(res);
  }),
);

export default router;

import express from 'express';
import { SuccessResponse } from '../../core/ApiResponse';
import { ProtectedRequest } from 'app-request';
import { BadRequestError, NotFoundError } from '../../core/ApiError';
import validator, { ValidationSource } from '../../helpers/validator';
import schema from './schema';
import asyncHandler from '../../helpers/asyncHandler';
import authentication from '../../auth/authentication';
import { Types } from 'mongoose';
import NotificationRepo from '../../database/repository/NotificationRepo';
import NotificationSettingsRepo from '../../database/repository/NotificationSettingsRepo';

const router = express.Router();

/*-------------------------------------------------------------------------*/
// Below all routes require authenticated user
/*-------------------------------------------------------------------------*/
router.use(authentication);

// Get all notifications for the authenticated user
router.get(
  '/',
  validator(schema.listNotifications, ValidationSource.QUERY),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { page, limit } = req.query;
    const notifications = await NotificationRepo.findByUser(
      req.user._id,
      Number(page),
      Number(limit),
    );
    if (notifications.length === 0)
      throw new NotFoundError('No notifications found');
    new SuccessResponse(
      'Notifications retrieved successfully',
      notifications,
    ).send(res);
  }),
);

router.post(
  '/',
  validator(schema.createNotification),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const notification = await NotificationRepo.create(req.body);
    if (!notification)
      throw new BadRequestError('Failed to create notification');
    new SuccessResponse('Notification created successfully', notification).send(
      res,
    );
  }),
);

// Mark a notification as read
router.put(
  '/:id/read',
  validator(schema.notificationId, ValidationSource.PARAM),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const notification = await NotificationRepo.markAsRead(
      new Types.ObjectId(req.params.id),
    );
    if (!notification) throw new BadRequestError('Notification not found');
    new SuccessResponse('Notification marked as read', notification).send(res);
  }),
);

// Mark all notifications as read
router.put(
  '/read-all',
  asyncHandler(async (req: ProtectedRequest, res) => {
    await NotificationRepo.markAllAsRead(req.user._id);
    new SuccessResponse('All notifications marked as read', 200).send(res);
  }),
);

// Get notification settings
router.get(
  '/settings',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const settings = await NotificationSettingsRepo.getOrCreate(req.user._id);
    new SuccessResponse(
      'Notification settings retrieved successfully',
      settings,
    ).send(res);
  }),
);

// Update notification settings
router.put(
  '/settings',
  validator(schema.updateSettings, ValidationSource.BODY),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const settings = await NotificationSettingsRepo.update(
      req.user._id,
      req.body,
    );
    if (!settings)
      throw new BadRequestError('Failed to update notification settings');
    new SuccessResponse(
      'Notification settings updated successfully',
      settings,
    ).send(res);
  }),
);

export default router;

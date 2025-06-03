import express from 'express';
import { SuccessResponse } from '../../core/ApiResponse';
import { BadRequestError, ForbiddenError } from '../../core/ApiError';
import { ProtectedRequest } from 'app-request';
import validator from '../../helpers/validator';
import schema from './schema';
import asyncHandler from '../../helpers/asyncHandler';
import authentication from '../../auth/authentication';
import { Types } from 'mongoose';
import DeviceRepo from '../../database/repository/DeviceRepo';
import SystemSettingsRepo from '../../database/repository/SystemSettingsRepo';

const router = express.Router();

/*-------------------------------------------------------------------------*/
// Below all routes require authenticated user
/*-------------------------------------------------------------------------*/
router.use(authentication);

/*-------------------------------------------------------------------------*/
// Device Management Routes
/*-------------------------------------------------------------------------*/

// POST /api/devices - Register mobile device
router.post(
  '/devices',
  validator(schema.registerDevice),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const {
      deviceId,
      deviceType,
      deviceName,
      pushToken,
      appVersion,
      osVersion,
      metadata,
    } = req.body;

    // Check if device already exists and update it, or create new one
    const device = await DeviceRepo.findOrCreateDevice({
      user: req.user._id,
      deviceId,
      deviceType,
      deviceName,
      pushToken,
      appVersion,
      osVersion,
      metadata,
    });

    new SuccessResponse('Device registered successfully', device).send(res);
  }),
);

// DELETE /api/devices/{id} - Unregister device
router.delete(
  '/devices/:id',
  validator(schema.deviceId),
  asyncHandler(async (req: ProtectedRequest, res) => {
    if (!Types.ObjectId.isValid(req.params.id)) {
      throw new BadRequestError('Invalid device ID format');
    }

    const deviceId = new Types.ObjectId(req.params.id);
    const device = await DeviceRepo.findById(deviceId);

    if (!device) {
      throw new BadRequestError('Device not found');
    }

    // Check if user owns the device
    if (device.user._id?.toString() !== req.user._id.toString()) {
      throw new ForbiddenError('Not authorized to delete this device');
    }

    const deleted = await DeviceRepo.deleteDevice(deviceId);

    if (!deleted) {
      throw new BadRequestError('Failed to delete device');
    }

    new SuccessResponse('Device unregistered successfully', {
      deleted: true,
    }).send(res);
  }),
);

// PUT /api/devices/{id}/token - Update push notification token
router.put(
  '/devices/:id/token',
  validator(schema.updatePushToken),
  asyncHandler(async (req: ProtectedRequest, res) => {
    if (!Types.ObjectId.isValid(req.params.id)) {
      throw new BadRequestError('Invalid device ID format');
    }

    const deviceId = new Types.ObjectId(req.params.id);
    const { pushToken } = req.body;

    const device = await DeviceRepo.findById(deviceId);

    if (!device) {
      throw new BadRequestError('Device not found');
    }

    // Check if user owns the device
    if (device.user._id?.toString() !== req.user._id.toString()) {
      throw new ForbiddenError('Not authorized to update this device');
    }

    const updatedDevice = await DeviceRepo.updatePushToken(deviceId, pushToken);

    if (!updatedDevice) {
      throw new BadRequestError('Failed to update push token');
    }

    new SuccessResponse('Push token updated successfully', updatedDevice).send(
      res,
    );
  }),
);

// GET /api/devices - Get user's devices (bonus endpoint for device management)
router.get(
  '/devices',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const devices = await DeviceRepo.findByUserId(req.user._id);
    new SuccessResponse('Devices retrieved successfully', devices).send(res);
  }),
);

/*-------------------------------------------------------------------------*/
// Mobile App Configuration Route
/*-------------------------------------------------------------------------*/

// GET /api/mobile/config - Get mobile app configuration
router.get(
  '/config',
  asyncHandler(async (req: ProtectedRequest, res) => {
    // Get various configuration settings that mobile app needs
    const [
      appSettings,
      notificationSettings,
      featureFlags,
      apiSettings,
      supportSettings,
    ] = await Promise.all([
      SystemSettingsRepo.getOrCreate('mobile_app', {
        version: '1.0.0',
        minSupportedVersion: '1.0.0',
        updateRequired: false,
        maintenanceMode: false,
        maintenanceMessage:
          'System is under maintenance. Please try again later.',
      }),
      SystemSettingsRepo.getOrCreate('mobile_notifications', {
        pushEnabled: true,
        emailEnabled: true,
        smsEnabled: true,
        reminderOffset: 30, // minutes before appointment
        maxRetries: 3,
      }),
      SystemSettingsRepo.getOrCreate('mobile_features', {
        telemedicine: true,
        appointmentBooking: true,
        prescriptionManagement: true,
        paymentIntegration: true,
        chatSupport: true,
        biometricAuth: true,
        darkMode: true,
      }),
      SystemSettingsRepo.getOrCreate('mobile_api', {
        baseUrl: process.env.API_BASE_URL || 'https://api.carepoint.com',
        timeout: 30000,
        retryAttempts: 3,
        uploadMaxSize: 10 * 1024 * 1024, // 10MB
      }),
      SystemSettingsRepo.getOrCreate('mobile_support', {
        helpEmail: 'support@carepoint.com',
        helpPhone: '+1-800-CARE-POINT',
        faqUrl: 'https://carepoint.com/faq',
        privacyPolicyUrl: 'https://carepoint.com/privacy',
        termsOfServiceUrl: 'https://carepoint.com/terms',
      }),
    ]);

    // Convert Map settings to objects for JSON response
    const mobileConfig = {
      app:
        appSettings.settings instanceof Map
          ? Object.fromEntries(appSettings.settings)
          : appSettings.settings,
      notifications:
        notificationSettings.settings instanceof Map
          ? Object.fromEntries(notificationSettings.settings)
          : notificationSettings.settings,
      features:
        featureFlags.settings instanceof Map
          ? Object.fromEntries(featureFlags.settings)
          : featureFlags.settings,
      api:
        apiSettings.settings instanceof Map
          ? Object.fromEntries(apiSettings.settings)
          : apiSettings.settings,
      support:
        supportSettings.settings instanceof Map
          ? Object.fromEntries(supportSettings.settings)
          : supportSettings.settings,
      user: {
        role: req.user.role,
        permissions: (req.user as any).permissions || [],
      },
      timestamp: new Date().toISOString(),
    };

    new SuccessResponse(
      'Mobile configuration retrieved successfully',
      mobileConfig,
    ).send(res);
  }),
);

export default router;

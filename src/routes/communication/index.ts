import express from 'express';
import { SuccessResponse } from '../../core/ApiResponse';
import { ProtectedRequest } from 'app-request';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../../core/ApiError';
import validator from '../../helpers/validator';
import schema from './schema';
import asyncHandler from '../../helpers/asyncHandler';
import authentication from '../../auth/authentication';
import { Types } from 'mongoose';
import MessageRepo from '../../database/repository/MessageRepo';
import ConversationRepo from '../../database/repository/ConversationRepo';
import BroadcastMessageRepo from '../../database/repository/BroadcastMessageRepo';
import User from '../../database/model/User';

const router = express.Router();

/*-------------------------------------------------------------------------*/
// Below all routes require authenticated user
/*-------------------------------------------------------------------------*/
router.use(authentication);

// Additional helper routes

// GET /api/messages/unread/count - Get unread message count
router.get(
  '/unread/count',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const count = await MessageRepo.getUnreadCount(req.user._id);
    new SuccessResponse('Unread count retrieved successfully', { count }).send(
      res,
    );
  }),
);

// GET /api/conversations - List user's conversations
router.get(
  '/conversations',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const conversations = await ConversationRepo.findByUserId(req.user._id);
    new SuccessResponse(
      'Conversations retrieved successfully',
      conversations,
    ).send(res);
  }),
);

// POST /api/messages - Send secure message
router.post(
  '/',
  validator(schema.createMessage),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const {
      recipients,
      subject,
      content,
      messageType,
      priority,
      attachments,
      metadata,
    } = req.body;

    // Validate recipients exist
    const recipientIds = recipients.map((id: string) => {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestError(`Invalid recipient ID: ${id}`);
      }
      return new Types.ObjectId(id);
    });

    // For direct messages with one recipient, get or create conversation
    let conversation;
    if (recipientIds.length === 1) {
      conversation = await ConversationRepo.getOrCreateDirectConversation(
        req.user._id,
        recipientIds[0],
      );
    } else {
      // For group messages, create new conversation
      const allParticipants = [req.user._id, ...recipientIds];
      conversation = await ConversationRepo.create({
        participants: allParticipants,
        type: 'GROUP',
        createdBy: req.user._id,
        title: subject || `Group conversation`,
        lastActivity: new Date(),
      });
    }

    // Create the message
    const message = await MessageRepo.create({
      conversation: conversation._id,
      sender: req.user._id,
      recipients: recipientIds,
      subject,
      content,
      messageType: messageType || 'TEXT',
      priority: priority || 'NORMAL',
      attachments,
      metadata,
      status: 'SENT',
      isEncrypted: true,
    });

    // Update conversation's last message
    await ConversationRepo.updateLastMessage(conversation._id, message._id);

    new SuccessResponse('Message sent successfully', message).send(res);
  }),
);

// GET /api/messages - List messages
router.get(
  '/',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const messages = await MessageRepo.findByUserId(req.user._id, limit, skip);

    new SuccessResponse('Messages retrieved successfully', {
      total: messages.length,
      messages,
      pagination: {
        page,
        limit,
        hasMore: messages.length === limit,
      },
    }).send(res);
  }),
);

// POST /api/broadcast-messages - Send announcement to multiple users
router.post(
  '/broadcast-messages',
  validator(schema.createBroadcastMessage),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const {
      title,
      content,
      targetAudience,
      specificRecipients,
      messageType,
      priority,
      scheduledAt,
      expiresAt,
      attachments,
      metadata,
    } = req.body;

    // Check if user has permission to send broadcast messages (admin/staff only)
    const user = req.user as User;
    if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
      throw new ForbiddenError(
        'Only administrators and staff can send broadcast messages',
      );
    }

    // Validate specific recipients if targetAudience is SPECIFIC
    let specificRecipientIds;
    if (targetAudience === 'SPECIFIC' && specificRecipients) {
      specificRecipientIds = specificRecipients.map((id: string) => {
        if (!Types.ObjectId.isValid(id)) {
          throw new BadRequestError(`Invalid recipient ID: ${id}`);
        }
        return new Types.ObjectId(id);
      });
    }

    const broadcastMessage = await BroadcastMessageRepo.create({
      title,
      content,
      sender: req.user._id,
      targetAudience,
      specificRecipients: specificRecipientIds,
      messageType: messageType || 'ANNOUNCEMENT',
      priority: priority || 'NORMAL',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      attachments,
      metadata,
      status: scheduledAt ? 'SCHEDULED' : 'SENT',
      sentAt: scheduledAt ? undefined : new Date(),
      deliveryStats: {
        sent: 0,
        delivered: 0,
        read: 0,
      },
    });

    new SuccessResponse(
      'Broadcast message created successfully',
      broadcastMessage,
    ).send(res);
  }),
);

// GET /api/broadcast-messages - List broadcast messages for user
router.get(
  '/broadcast-messages',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const user = req.user as User;

    // Determine target audience based on user role
    let targetAudience: 'ALL' | 'PATIENTS' | 'DOCTORS' | 'STAFF' | 'SPECIFIC';
    if (user.role === 'PATIENT') {
      targetAudience = 'PATIENTS';
    } else if (user.role === 'DOCTOR') {
      targetAudience = 'DOCTORS';
    } else {
      targetAudience = 'STAFF';
    }

    const messages = await BroadcastMessageRepo.findByTargetAudience(
      targetAudience,
      req.user._id,
      limit,
      skip,
    );

    new SuccessResponse('Broadcast messages retrieved successfully', {
      messages,
      pagination: {
        page,
        limit,
        hasMore: messages.length === limit,
      },
    }).send(res);
  }),
);

// GET /api/broadcast-messages/debug - Debug route to see all broadcast messages
router.get(
  '/broadcast-messages/debug',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const user = req.user as User;

    // Get all messages to debug
    const allMessages = await BroadcastMessageRepo.findAll(50, 0);

    // Get messages by sender (if user is admin/staff)
    const myMessages = await BroadcastMessageRepo.findBySender(
      req.user._id,
      50,
      0,
    );

    new SuccessResponse('Debug broadcast messages', {
      userRole: user.role,
      totalMessages: allMessages.length,
      myMessages: myMessages.length,
      allMessages: allMessages.map((msg) => ({
        _id: msg._id,
        title: msg.title,
        status: msg.status,
        targetAudience: msg.targetAudience,
        sender: msg.sender,
        createdAt: msg.createdAt,
        scheduledAt: msg.scheduledAt,
        expiresAt: msg.expiresAt,
      })),
      myMessageDetails: myMessages.map((msg) => ({
        _id: msg._id,
        title: msg.title,
        status: msg.status,
        targetAudience: msg.targetAudience,
        createdAt: msg.createdAt,
        scheduledAt: msg.scheduledAt,
        expiresAt: msg.expiresAt,
      })),
    }).send(res);
  }),
);

// GET /api/broadcast-messages/all-statuses - Get broadcast messages with all statuses
router.get(
  '/broadcast-messages/all-statuses',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const user = req.user as User;

    // Determine target audience based on user role
    let targetAudience: 'ALL' | 'PATIENTS' | 'DOCTORS' | 'STAFF' | 'SPECIFIC';
    if (user.role === 'PATIENT') {
      targetAudience = 'PATIENTS';
    } else if (user.role === 'DOCTOR') {
      targetAudience = 'DOCTORS';
    } else {
      targetAudience = 'STAFF';
    }

    const messages = await BroadcastMessageRepo.findByTargetAudienceAllStatuses(
      targetAudience,
      req.user._id,
      limit,
      skip,
    );

    new SuccessResponse(
      'Broadcast messages (all statuses) retrieved successfully',
      {
        userRole: user.role,
        targetAudience,
        messages,
        pagination: {
          page,
          limit,
          hasMore: messages.length === limit,
        },
      },
    ).send(res);
  }),
);

// GET /api/messages/{id} - Get message details
router.get(
  '/:id',
  asyncHandler(async (req: ProtectedRequest, res) => {
    if (!Types.ObjectId.isValid(req.params.id)) {
      throw new BadRequestError('Invalid message ID format');
    }

    const messageId = new Types.ObjectId(req.params.id);
    const message = await MessageRepo.findById(messageId);

    if (!message) {
      throw new NotFoundError('Message not found');
    }

    // Check if user is sender or recipient
    const isAuthorized =
      message.sender._id.toString() === req.user._id.toString() ||
      message.recipients.some(
        (recipient: any) =>
          recipient._id.toString() === req.user._id.toString(),
      );

    if (!isAuthorized) {
      throw new ForbiddenError('Not authorized to view this message');
    }

    // Mark as read if user is recipient and hasn't read yet
    const hasRead = message.readBy.some(
      (read: any) => read.user.toString() === req.user._id.toString(),
    );

    if (!hasRead && message.sender._id.toString() !== req.user._id.toString()) {
      await MessageRepo.markAsRead(messageId, req.user._id);
    }

    new SuccessResponse('Message retrieved successfully', message).send(res);
  }),
);

// PUT /api/messages/{id}/status - Mark message status
router.put(
  '/:id/status',
  validator(schema.updateMessageStatus),
  asyncHandler(async (req: ProtectedRequest, res) => {
    if (!Types.ObjectId.isValid(req.params.id)) {
      throw new BadRequestError('Invalid message ID format');
    }

    const messageId = new Types.ObjectId(req.params.id);
    const { status } = req.body;

    const message = await MessageRepo.findById(messageId);
    if (!message) {
      throw new NotFoundError('Message not found');
    }

    // Check if user is sender or recipient
    const isAuthorized =
      message.sender._id.toString() === req.user._id.toString() ||
      message.recipients.some(
        (recipient: any) =>
          recipient._id.toString() === req.user._id.toString(),
      );

    if (!isAuthorized) {
      throw new ForbiddenError('Not authorized to update this message');
    }

    const updatedMessage = await MessageRepo.updateStatus(messageId, status);

    new SuccessResponse(
      'Message status updated successfully',
      updatedMessage,
    ).send(res);
  }),
);

// GET /api/conversations/{id} - Get conversation history
router.get(
  '/conversations/:id',
  asyncHandler(async (req: ProtectedRequest, res) => {
    if (!Types.ObjectId.isValid(req.params.id)) {
      throw new BadRequestError('Invalid conversation ID format');
    }

    const conversationId = new Types.ObjectId(req.params.id);
    const conversation = await ConversationRepo.findById(conversationId);

    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    // Check if user is participant
    const isParticipant = conversation.participants.some(
      (participant: any) =>
        participant._id.toString() === req.user._id.toString(),
    );

    if (!isParticipant) {
      throw new ForbiddenError('Not authorized to view this conversation');
    }

    // Get messages in conversation
    const messages = await MessageRepo.findByConversationId(conversationId);

    new SuccessResponse('Conversation retrieved successfully', {
      conversation,
      messages,
    }).send(res);
  }),
);

export default router;

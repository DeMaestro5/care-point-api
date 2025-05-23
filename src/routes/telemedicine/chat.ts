import express from 'express';
import asyncHandler from '../../helpers/asyncHandler';
import { ProtectedRequest } from '../../types/app-request';
import { SuccessResponse } from '../../core/ApiResponse';
import { BadRequestError } from '../../core/ApiError';
import validator, { ValidationSource } from '../../helpers/validator';
import schema from './schema';
import TelemedicineSessionRepo from '../../database/repository/TelemedicineSessionRepo';
import TelemedicineChatRepo from '../../database/repository/TelemedicineChatRepo';
import { Types } from 'mongoose';

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  validator(schema.sessionId, ValidationSource.PARAM),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const session = await TelemedicineSessionRepo.findById(
      new Types.ObjectId(req.params.id),
    );

    if (!session) throw new BadRequestError('Telemedicine session not found');

    const limit = parseInt(req.query.limit as string) || 50;
    const skip = parseInt(req.query.skip as string) || 0;

    const messages = await TelemedicineChatRepo.findBySessionId(
      new Types.ObjectId(req.params.id),
      limit,
      skip,
    );

    new SuccessResponse('Chat history retrieved successfully', messages).send(
      res,
    );
  }),
);

router.post(
  '/',
  validator(schema.sessionId, ValidationSource.PARAM),
  validator(schema.chatMessage),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const session = await TelemedicineSessionRepo.findById(
      new Types.ObjectId(req.params.id),
    );

    if (!session) throw new BadRequestError('Telemedicine session not found');

    const chat = await TelemedicineChatRepo.create({
      session: new Types.ObjectId(req.params.id),
      sender: req.user._id,
      message: req.body.message,
    });

    new SuccessResponse('Message sent successfully', chat).send(res);
  }),
);

export default router;

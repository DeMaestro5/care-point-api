import express from 'express';
import { SuccessResponse } from '../../core/ApiResponse';
import TelemedicineSessionRepo from '../../database/repository/TelemedicineSessionRepo';
import { ProtectedRequest } from 'app-request';
import { BadRequestError } from '../../core/ApiError';
import validator, { ValidationSource } from '../../helpers/validator';
import schema from './schema';
import asyncHandler from '../../helpers/asyncHandler';
import authentication from '../../auth/authentication';
import { Types } from 'mongoose';
import status from './status';
import token from './token';
import recording from './recording';
import chat from './chat';

const router = express.Router();

/*-------------------------------------------------------------------------*/
// Below all routes require authenticated user
/*-------------------------------------------------------------------------*/
router.use(authentication);

router.use('/sessions/:id/status', status);
router.use('/sessions/:id/token', token);
router.use('/sessions/:id/recording', recording);
router.use('/sessions/:id/chat', chat);

router.post(
  '/sessions',
  validator(schema.createSession),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const session = await TelemedicineSessionRepo.create({
      patient: new Types.ObjectId(req.body.patient),
      doctor: new Types.ObjectId(req.body.doctor),
      startTime: new Date(req.body.startTime),
      meetingLink: req.body.meetingLink,
      notes: req.body.notes,
    });

    new SuccessResponse(
      'Telemedicine session created successfully',
      session,
    ).send(res);
  }),
);

router.get(
  '/sessions/:id',
  validator(schema.sessionId, ValidationSource.PARAM),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const session = await TelemedicineSessionRepo.findById(
      new Types.ObjectId(req.params.id),
    );
    console.log(session);

    if (!session) throw new BadRequestError('Telemedicine session not found');
    new SuccessResponse('success', session).send(res);
  }),
);

export default router;

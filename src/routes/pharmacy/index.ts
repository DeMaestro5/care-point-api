import express from 'express';
import { SuccessResponse } from '../../core/ApiResponse';
import PharmacyRepo from '../../database/repository/PharmacyRepo';
import { ProtectedRequest } from 'app-request';
import { BadRequestError } from '../../core/ApiError';
import validator from '../../helpers/validator';
import schema from './schema';
import asyncHandler from '../../helpers/asyncHandler';
import authentication from '../../auth/authentication';
import { Types } from 'mongoose';

const router = express.Router();

/*-------------------------------------------------------------------------*/
router.use(authentication);
/*-------------------------------------------------------------------------*/

router.get(
  '/:id',
  validator(schema.pharmacyId),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const pharmacy = await PharmacyRepo.findById(
      new Types.ObjectId(req.params.id),
    );
    if (!pharmacy) throw new BadRequestError('Pharmacy not found');
    new SuccessResponse('success', pharmacy).send(res);
  }),
);

export default router;

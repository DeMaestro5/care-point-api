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
import { PharmacyModel } from '../../database/model/Pharmacy';
import inventoryRouter from './inventory';
import prescriptionsRouter from './prescriptions';

const router = express.Router();

/*-------------------------------------------------------------------------*/
router.use(authentication);
/*-------------------------------------------------------------------------*/

router.use('/:pharmacyId/inventory', inventoryRouter);
router.use('/:pharmacyId/prescriptions', prescriptionsRouter);

router.get(
  '/',
  validator(schema.listPharmacies),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const { name, city, state, page = 1, limit = 10 } = req.query;
    const filter: any = { status: true };

    if (name) filter.name = { $regex: name, $options: 'i' };
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (state) filter.state = { $regex: state, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const pharmacies = await PharmacyModel.find(filter)
      .populate('user', 'name email profilePicUrl')
      .skip(skip)
      .limit(Number(limit))
      .lean()
      .exec();

    const total = await PharmacyModel.countDocuments(filter);

    new SuccessResponse('success', {
      pharmacies,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    }).send(res);
  }),
);

router.get(
  '/:pharmacyId',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const pharmacy = await PharmacyRepo.findById(
      new Types.ObjectId(req.params.pharmacyId),
    );
    if (!pharmacy) throw new BadRequestError('Pharmacy not found');
    new SuccessResponse('success', pharmacy).send(res);
  }),
);

router.put(
  '/:pharmacyId',
  validator(schema.updatePharmacy),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const pharmacy = await PharmacyRepo.findById(
      new Types.ObjectId(req.params.pharmacyId),
    );
    if (!pharmacy) throw new BadRequestError('Pharmacy not found');

    const updatedPharmacy = await PharmacyRepo.update({
      ...pharmacy,
      ...req.body,
      _id: pharmacy._id,
    });

    new SuccessResponse('Pharmacy updated successfully', updatedPharmacy).send(
      res,
    );
  }),
);

export default router;

import { Router } from 'express';
import { Types } from 'mongoose';
import { BadRequestError } from '../../core/ApiError';
import { NotFoundResponse, SuccessResponse } from '../../core/ApiResponse';
import asyncHandler from '../../helpers/asyncHandler';
import PaymentRepo from '../../database/repository/PaymentRepo';

const router = Router({ mergeParams: true });

/**
 * @route   GET /api/patients/:patientId/payments
 * @desc    Get patient's payment history
 * @access  Private
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const patientId = new Types.ObjectId(req.params.patientId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (page < 1)
      throw new BadRequestError('Page number must be greater than 0');
    if (limit < 1) throw new BadRequestError('Limit must be greater than 0');

    const { payments, total } = await PaymentRepo.findByPatientId(
      patientId,
      page,
      limit,
    );

    if (payments.length === 0) {
      return new NotFoundResponse('No payments found').send(res);
    }

    return new SuccessResponse('Payment history retrieved successfully', {
      patientId,
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }).send(res);
  }),
);

export default router;

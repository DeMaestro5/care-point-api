import express from 'express';
import { SuccessResponse } from '../../core/ApiResponse';
import { ProtectedRequest } from 'app-request';
import validator from '../../helpers/validator';
import schema from './schema';
import asyncHandler from '../../helpers/asyncHandler';
import authentication from '../../auth/authentication';
import { UserService } from '../../services';
import { BadRequestError } from '../../core/ApiError';
import _ from 'lodash';

const router = express.Router();

/*-------------------------------------------------------------------------*/
router.use(authentication);
/*-------------------------------------------------------------------------*/

router.get(
  '/me',
  asyncHandler(async (req: ProtectedRequest, res) => {
    const user = await UserService.findById(req.user._id);
    if (!user) throw new BadRequestError('User not registered');
    const userData = _.pick(user, ['name', 'email', 'profilePicUrl', 'role']);
    new SuccessResponse('success', userData).send(res);
  }),
);

router.put(
  '/',
  validator(schema.profile),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const updatedUser = await UserService.updateProfile(req.user._id, {
      name: req.body.name,
      profilePicUrl: req.body.profilePicUrl,
    });

    return new SuccessResponse('Profile updated', updatedUser).send(res);
  }),
);

export default router;

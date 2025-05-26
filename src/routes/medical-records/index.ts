import express from 'express';
import attachmentsRouter from './attachments';
import authentication from '../../auth/authentication';

const router = express.Router();

router.use(authentication);
// Mount attachments routes
router.use('/:id/attachments', attachmentsRouter);

export default router;

import { Router } from 'express';
import * as carReturnController from '../controllers/carReturn.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', carReturnController.getAll);
router.get('/:id', carReturnController.getById);
router.post('/', carReturnController.create);

export default router;

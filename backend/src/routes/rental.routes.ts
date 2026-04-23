import { Router } from 'express';
import * as rentalController from '../controllers/rental.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', rentalController.getAll);
router.get('/:id', rentalController.getById);
router.post('/', rentalController.create);
router.put('/:id', rentalController.update);
router.patch('/:id/status', rentalController.updateStatus);
router.post('/mark-overdue', requireAdmin, rentalController.markOverdue);

export default router;

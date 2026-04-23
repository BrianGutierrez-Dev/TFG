import { Router } from 'express';
import * as employeeController from '../controllers/employee.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', employeeController.getAll);
router.get('/:id', employeeController.getById);
router.post('/', requireAdmin, employeeController.create);
router.put('/:id', requireAdmin, employeeController.update);
router.delete('/:id', requireAdmin, employeeController.remove);

export default router;

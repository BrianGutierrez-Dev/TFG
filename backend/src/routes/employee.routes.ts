import { Router } from 'express';
import * as employeeController from '../controllers/employee.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { CreateEmployeeDto, UpdateEmployeeDto } from '../dtos/employee.dto';

const router = Router();

router.use(authenticate);

router.get('/', employeeController.getAll);
router.get('/:id', employeeController.getById);
router.post('/', requireAdmin, validateBody(CreateEmployeeDto), employeeController.create);
router.put('/:id', requireAdmin, validateBody(UpdateEmployeeDto), employeeController.update);
router.delete('/:id', requireAdmin, employeeController.remove);

export default router;

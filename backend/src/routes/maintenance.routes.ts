import { Router } from 'express';
import * as maintenanceController from '../controllers/maintenance.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', maintenanceController.getAll);
router.get('/:id', maintenanceController.getById);
router.post('/', maintenanceController.create);
router.put('/:id', maintenanceController.update);
router.delete('/:id', maintenanceController.remove);

export default router;

import { Router } from 'express';
import * as incidentController from '../controllers/incident.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', incidentController.getAll);
router.get('/:id', incidentController.getById);
router.post('/', incidentController.create);
router.put('/:id', incidentController.update);
router.patch('/:id/resolve', incidentController.resolve);
router.delete('/:id', incidentController.remove);

export default router;

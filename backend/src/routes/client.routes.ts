import { Router } from 'express';
import * as clientController from '../controllers/client.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', clientController.getAll);
router.get('/:id', clientController.getById);
router.get('/:id/history', clientController.getHistory);
router.post('/', clientController.create);
router.put('/:id', clientController.update);
router.delete('/:id', clientController.remove);

export default router;

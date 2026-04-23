import { Router } from 'express';
import * as carController from '../controllers/car.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', carController.getAll);
router.get('/:id', carController.getById);
router.post('/', carController.create);
router.put('/:id', carController.update);
router.delete('/:id', carController.remove);

export default router;

import { Router } from 'express';
import * as repairController from '../controllers/repair.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', repairController.getAll);
router.get('/:id', repairController.getById);
router.post('/', repairController.create);
router.put('/:id', repairController.update);
router.delete('/:id', repairController.remove);

export default router;

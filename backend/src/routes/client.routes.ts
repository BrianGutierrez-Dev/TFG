import { Router } from 'express';
import * as clientController from '../controllers/client.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { CreateClientDto, UpdateClientDto } from '../dtos/client.dto';

const router = Router();

router.use(authenticate);

router.get('/', clientController.getAll);
router.get('/:id', clientController.getById);
router.get('/:id/history', clientController.getHistory);
router.post('/', validateBody(CreateClientDto), clientController.create);
router.put('/:id', validateBody(UpdateClientDto), clientController.update);
router.delete('/:id', clientController.remove);

export default router;

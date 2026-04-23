import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos de inicio de sesión. Inténtalo de nuevo en 15 minutos.' },
});

const router = Router();

router.post('/login', loginLimiter, authController.login);
router.get('/me', authenticate, authController.getProfile);

export default router;

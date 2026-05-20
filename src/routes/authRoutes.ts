import { Router } from 'express';
import { login, me, register } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireFields } from '../middleware/validationMiddleware';

export const authRoutes = Router();

authRoutes.post('/register', requireFields(['name', 'email', 'password']), register);
authRoutes.post('/login', requireFields(['email', 'password']), login);
authRoutes.get('/me', authMiddleware, me);

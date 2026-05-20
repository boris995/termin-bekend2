import { Router } from 'express';
import { createSeason, deleteSeason, getActiveSeason, getSeason, getSeasons, updateSeason } from '../controllers/seasonController';
import { adminMiddleware, authMiddleware } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validationMiddleware';
import { seasonSchema } from '../validation/schemas';

export const seasonRoutes = Router();

seasonRoutes.get('/', getSeasons);
seasonRoutes.get('/active/current', getActiveSeason);
seasonRoutes.get('/:id', getSeason);
seasonRoutes.post('/', authMiddleware, adminMiddleware, validateBody(seasonSchema), createSeason);
seasonRoutes.put('/:id', authMiddleware, adminMiddleware, validateBody(seasonSchema.partial()), updateSeason);
seasonRoutes.delete('/:id', authMiddleware, adminMiddleware, deleteSeason);

import { Router } from 'express';
import { createPlayer, deletePlayer, getPlayer, getSeasonPlayers, getTeamPlayers, updatePlayer } from '../controllers/playerController';
import { adminMiddleware, authMiddleware } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validationMiddleware';
import { playerSchema, playerUpdateSchema } from '../validation/schemas';

export const playerRoutes = Router();

playerRoutes.get('/seasons/:seasonId/players', getSeasonPlayers);
playerRoutes.get('/teams/:teamId/players', getTeamPlayers);
playerRoutes.get('/players/:id', getPlayer);
playerRoutes.post('/players', authMiddleware, adminMiddleware, validateBody(playerSchema), createPlayer);
playerRoutes.put('/players/:id', authMiddleware, adminMiddleware, validateBody(playerUpdateSchema), updatePlayer);
playerRoutes.delete('/players/:id', authMiddleware, adminMiddleware, deletePlayer);

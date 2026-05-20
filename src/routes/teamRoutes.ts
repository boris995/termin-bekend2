import { Router } from 'express';
import { createTeam, deleteTeam, getTeams, updateTeam } from '../controllers/teamController';
import { adminMiddleware, authMiddleware } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validationMiddleware';
import { teamSchema } from '../validation/schemas';

export const teamRoutes = Router();

teamRoutes.get('/seasons/:seasonId/teams', getTeams);
teamRoutes.post('/seasons/:seasonId/teams', authMiddleware, adminMiddleware, validateBody(teamSchema), createTeam);
teamRoutes.put('/teams/:id', authMiddleware, adminMiddleware, validateBody(teamSchema.partial()), updateTeam);
teamRoutes.delete('/teams/:id', authMiddleware, adminMiddleware, deleteTeam);

import { Router } from 'express';
import { getMatch, getSeasonMatches, postMatch, postPlayerRating, postPlayerVote, putMatch, removeMatch } from '../controllers/matchController';
import { adminMiddleware, authMiddleware } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validationMiddleware';
import { matchSchema, playerRatingSchema, playerVoteSchema } from '../validation/schemas';

export const matchRoutes = Router();

matchRoutes.get('/seasons/:seasonId/matches', getSeasonMatches);
matchRoutes.get('/matches/:id', getMatch);
matchRoutes.post('/matches/:id/ratings', validateBody(playerRatingSchema), postPlayerRating);
matchRoutes.post('/matches/:id/player-of-match', validateBody(playerVoteSchema), postPlayerVote);
matchRoutes.post('/matches', authMiddleware, adminMiddleware, validateBody(matchSchema), postMatch);
matchRoutes.put('/matches/:id', authMiddleware, adminMiddleware, validateBody(matchSchema), putMatch);
matchRoutes.delete('/matches/:id', authMiddleware, adminMiddleware, removeMatch);

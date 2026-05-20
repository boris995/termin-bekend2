import { Router } from 'express';
import {
  createCmsBlock,
  createNextMatch,
  deleteCmsBlock,
  finishScheduledMatch,
  getCmsBlocks,
  getNextMatches,
  startScheduledMatch,
  updateCmsBlock,
  updateNextMatch
} from '../controllers/cmsController';
import { adminMiddleware, authMiddleware } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validationMiddleware';
import { cmsBlockSchema, cmsBlockUpdateSchema, finishNextMatchSchema, nextMatchSchema, nextMatchUpdateSchema } from '../validation/schemas';

export const cmsRoutes = Router();

cmsRoutes.get('/blocks', getCmsBlocks);
cmsRoutes.post('/blocks', authMiddleware, adminMiddleware, validateBody(cmsBlockSchema), createCmsBlock);
cmsRoutes.put('/blocks/:id', authMiddleware, adminMiddleware, validateBody(cmsBlockUpdateSchema), updateCmsBlock);
cmsRoutes.delete('/blocks/:id', authMiddleware, adminMiddleware, deleteCmsBlock);
cmsRoutes.get('/next-matches', getNextMatches);
cmsRoutes.post('/next-matches', authMiddleware, adminMiddleware, validateBody(nextMatchSchema), createNextMatch);
cmsRoutes.put('/next-matches/:id', authMiddleware, adminMiddleware, validateBody(nextMatchUpdateSchema), updateNextMatch);
cmsRoutes.post('/next-matches/:id/start', authMiddleware, adminMiddleware, startScheduledMatch);
cmsRoutes.post('/next-matches/:id/finish', authMiddleware, adminMiddleware, validateBody(finishNextMatchSchema), finishScheduledMatch);

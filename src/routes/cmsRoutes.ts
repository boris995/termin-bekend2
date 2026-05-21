import { Router } from 'express';
import {
  createCmsBlock,
  createNextMatch,
  deleteCmsBlock,
  finishScheduledMatch,
  getCmsBlocks,
  getDonationPage,
  getNextMatches,
  getSettings,
  startScheduledMatch,
  updateCmsBlock,
  updateDonationPage,
  updateNextMatch,
  updateSettings
} from '../controllers/cmsController';
import { adminMiddleware, authMiddleware } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validationMiddleware';
import { cmsBlockSchema, cmsBlockUpdateSchema, donationPageSchema, finishNextMatchSchema, nextMatchSchema, nextMatchUpdateSchema } from '../validation/schemas';

export const cmsRoutes = Router();

cmsRoutes.get('/settings', getSettings);
cmsRoutes.put('/settings', authMiddleware, adminMiddleware, updateSettings);
cmsRoutes.get('/donation-page', getDonationPage);
cmsRoutes.put('/donation-page', authMiddleware, adminMiddleware, validateBody(donationPageSchema), updateDonationPage);
cmsRoutes.get('/blocks', getCmsBlocks);
cmsRoutes.post('/blocks', authMiddleware, adminMiddleware, validateBody(cmsBlockSchema), createCmsBlock);
cmsRoutes.put('/blocks/:id', authMiddleware, adminMiddleware, validateBody(cmsBlockUpdateSchema), updateCmsBlock);
cmsRoutes.delete('/blocks/:id', authMiddleware, adminMiddleware, deleteCmsBlock);
cmsRoutes.get('/next-matches', getNextMatches);
cmsRoutes.post('/next-matches', authMiddleware, adminMiddleware, validateBody(nextMatchSchema), createNextMatch);
cmsRoutes.put('/next-matches/:id', authMiddleware, adminMiddleware, validateBody(nextMatchUpdateSchema), updateNextMatch);
cmsRoutes.post('/next-matches/:id/start', authMiddleware, adminMiddleware, startScheduledMatch);
cmsRoutes.post('/next-matches/:id/finish', authMiddleware, adminMiddleware, validateBody(finishNextMatchSchema), finishScheduledMatch);

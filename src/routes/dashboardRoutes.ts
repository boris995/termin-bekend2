import { Router } from 'express';
import { getSeasonDashboard, getSeasonVotingAnalytics } from '../controllers/dashboardController';
import { adminMiddleware, authMiddleware } from '../middleware/authMiddleware';

export const dashboardRoutes = Router();

dashboardRoutes.get('/season/:seasonId', getSeasonDashboard);
dashboardRoutes.get('/season/:seasonId/voting-analytics', authMiddleware, adminMiddleware, getSeasonVotingAnalytics);

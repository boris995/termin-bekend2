import { Router } from 'express';
import { getSeasonDashboard } from '../controllers/dashboardController';

export const dashboardRoutes = Router();

dashboardRoutes.get('/season/:seasonId', getSeasonDashboard);

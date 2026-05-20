import { Router } from 'express';
import { getHome } from '../controllers/homeController';

export const homeRoutes = Router();

homeRoutes.get('/', getHome);

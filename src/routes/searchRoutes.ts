import { Router } from 'express';
import { searchPublicContent } from '../controllers/searchController';

export const searchRoutes = Router();

searchRoutes.get('/', searchPublicContent);

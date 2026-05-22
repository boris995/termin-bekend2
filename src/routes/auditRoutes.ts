import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditController';
import { adminMiddleware, authMiddleware } from '../middleware/authMiddleware';

export const auditRoutes = Router();

auditRoutes.get('/', authMiddleware, adminMiddleware, getAuditLogs);

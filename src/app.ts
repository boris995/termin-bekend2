import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import './models';
import { authRoutes } from './routes/authRoutes';
import { dashboardRoutes } from './routes/dashboardRoutes';
import { cmsRoutes } from './routes/cmsRoutes';
import { homeRoutes } from './routes/homeRoutes';
import { matchRoutes } from './routes/matchRoutes';
import { playerRoutes } from './routes/playerRoutes';
import { seasonRoutes } from './routes/seasonRoutes';
import { teamRoutes } from './routes/teamRoutes';
import { uploadRoutes } from './routes/uploadRoutes';
import { uploadRoot } from './middleware/uploadMiddleware';
import { fail } from './utils/http';

dotenv.config();

export const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS origin nije dozvoljen: ${origin}`));
    }
  })
);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));
app.use(express.json());
app.use('/uploads', express.static(uploadRoot));

app.get('/api/health', (_req, res) => res.json({ success: true, data: { status: 'ok' } }));
app.use('/api/auth', authRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/seasons', seasonRoutes);
app.use('/api', teamRoutes);
app.use('/api', playerRoutes);
app.use('/api', matchRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((_req, res) => fail(res, 'Ruta nije pronađena.', 404));
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => fail(res, error.message || 'Serverska greška.', 500));

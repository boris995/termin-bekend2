import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config/env';
import { User } from '../models';
import { fail } from '../utils/http';

export interface AuthRequest extends Request {
  user?: User;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return fail(res, 'Token nije poslat.', 401);

    const decoded = jwt.verify(token, jwtSecret()) as { id: number };
    const user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
    if (!user) return fail(res, 'Korisnik nije pronadjen.', 401);

    req.user = user;
    return next();
  } catch {
    return fail(res, 'Token nije validan.', 401);
  }
};

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) return fail(res, 'Korisnik nije autentifikovan.', 401);
  if (req.user.role !== 'admin') return fail(res, 'Samo administrator ima dozvolu za ovu akciju.', 403);
  return next();
};

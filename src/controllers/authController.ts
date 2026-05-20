import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { fail, ok } from '../utils/http';
import { AuthRequest } from '../middleware/authMiddleware';

const publicUser = (user: User) => ({ id: user.id, name: user.name, email: user.email, role: user.role });
const tokenFor = (user: User) => jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'change-me', { expiresIn: '7d' });

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role = 'admin' } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });
    return ok(res, { user: publicUser(user), token: tokenFor(user) }, 201);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Registracija nije uspjela.');
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) return fail(res, 'Pogrešan email ili lozinka.', 401);
  return ok(res, { user: publicUser(user), token: tokenFor(user) });
};

export const me = async (req: AuthRequest, res: Response) => ok(res, { user: req.user });

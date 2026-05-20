import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { fail } from '../utils/http';

export const requireFields = (fields: string[]) => (req: Request, res: Response, next: NextFunction) => {
  const missing = fields.filter((field) => req.body[field] === undefined || req.body[field] === null || req.body[field] === '');
  if (missing.length) return fail(res, `Nedostaju obavezna polja: ${missing.join(', ')}.`);
  return next();
};

export const validateBody = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`).join('; ');
    return fail(res, message || 'Request body nije validan.');
  }
  req.body = parsed.data;
  return next();
};

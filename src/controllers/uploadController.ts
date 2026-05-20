import { Request, Response } from 'express';
import { fail, ok } from '../utils/http';

export const uploadPlayerImage = (req: Request, res: Response) => {
  const file = req.file;
  if (!file) return fail(res, 'Slika nije poslata.');
  return ok(res, { filename: file.filename, url: `/uploads/${file.filename}` }, 201);
};

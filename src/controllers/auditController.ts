import { Request, Response } from 'express';
import { AuditLog } from '../models';
import { ok } from '../utils/http';

export const getAuditLogs = async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit || 100), 200);
  const logs = await AuditLog.findAll({
    include: ['user'],
    order: [['createdAt', 'DESC']],
    limit
  });
  return ok(res, logs);
};

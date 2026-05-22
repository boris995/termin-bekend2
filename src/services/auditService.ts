import { AuthRequest } from '../middleware/authMiddleware';
import { AuditAction, AuditLog } from '../models/AuditLog';

interface AuditInput {
  action: AuditAction;
  entityType: string;
  entityId?: number | string | null;
  label?: string | null;
  metadata?: Record<string, unknown> | null;
}

export const logAdminAction = async (req: AuthRequest, input: AuditInput) => {
  if (!req.user) return;

  await AuditLog.create({
    userId: req.user.id,
    userEmail: req.user.email,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId === undefined || input.entityId === null ? null : String(input.entityId),
    label: input.label || null,
    metadata: input.metadata || null
  });
};

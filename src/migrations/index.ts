import { migration as initialSchema } from './20260521232000-initial-schema';
import { migration as auditLogs } from './20260521234500-audit-logs';
import { Migration } from './types';

export const migrations: Migration[] = [initialSchema, auditLogs];

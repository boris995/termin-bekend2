import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type AuditAction = 'create' | 'update' | 'delete' | 'start' | 'finish' | 'settings';

interface AuditLogAttributes {
  id: number;
  userId?: number | null;
  userEmail?: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: number | string | null;
  label?: string | null;
  metadata?: Record<string, unknown> | null;
}

type AuditLogCreationAttributes = Optional<AuditLogAttributes, 'id' | 'userId' | 'userEmail' | 'entityId' | 'label' | 'metadata'>;

export class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> implements AuditLogAttributes {
  declare id: number;
  declare userId: number | null;
  declare userEmail: string | null;
  declare action: AuditAction;
  declare entityType: string;
  declare entityId: number | string | null;
  declare label: string | null;
  declare metadata: Record<string, unknown> | null;
}

AuditLog.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    userEmail: { type: DataTypes.STRING, allowNull: true },
    action: { type: DataTypes.ENUM('create', 'update', 'delete', 'start', 'finish', 'settings'), allowNull: false },
    entityType: { type: DataTypes.STRING(80), allowNull: false },
    entityId: { type: DataTypes.STRING(80), allowNull: true },
    label: { type: DataTypes.STRING, allowNull: true },
    metadata: { type: DataTypes.JSON, allowNull: true }
  },
  {
    sequelize,
    tableName: 'audit_logs',
    updatedAt: false,
    indexes: [
      { fields: ['entityType', 'entityId'] },
      { fields: ['createdAt'] }
    ]
  }
);

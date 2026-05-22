import { DataTypes } from 'sequelize';
import { Migration } from './types';

export const migration: Migration = {
  name: '20260521234500-audit-logs',
  up: async (queryInterface) => {
    const tables = (await queryInterface.showAllTables()) as unknown[];
    const exists = tables.map((table) => (typeof table === 'string' ? table : (table as { tableName: string }).tableName)).includes('audit_logs');
    if (exists) return;

    await queryInterface.createTable('audit_logs', {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      userEmail: { type: DataTypes.STRING, allowNull: true },
      action: { type: DataTypes.ENUM('create', 'update', 'delete', 'start', 'finish', 'settings'), allowNull: false },
      entityType: { type: DataTypes.STRING(80), allowNull: false },
      entityId: { type: DataTypes.STRING(80), allowNull: true },
      label: { type: DataTypes.STRING, allowNull: true },
      metadata: { type: DataTypes.JSON, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    });

    await queryInterface.addIndex('audit_logs', ['entityType', 'entityId'], { name: 'audit_logs_entity_type_entity_id' });
    await queryInterface.addIndex('audit_logs', ['createdAt'], { name: 'audit_logs_created_at' });
  }
};

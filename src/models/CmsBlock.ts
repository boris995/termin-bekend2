import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type CmsBlockType = 'text' | 'news' | 'announcement';

interface CmsBlockAttributes {
  id: number;
  title: string;
  body: string;
  type: CmsBlockType;
  imageUrl?: string | null;
  sortOrder: number;
  isPublished: boolean;
}

type CmsBlockCreationAttributes = Optional<CmsBlockAttributes, 'id' | 'type' | 'imageUrl' | 'sortOrder' | 'isPublished'>;

export class CmsBlock extends Model<CmsBlockAttributes, CmsBlockCreationAttributes> implements CmsBlockAttributes {
  declare id: number;
  declare title: string;
  declare body: string;
  declare type: CmsBlockType;
  declare imageUrl: string | null;
  declare sortOrder: number;
  declare isPublished: boolean;
}

CmsBlock.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    body: { type: DataTypes.TEXT, allowNull: false },
    type: { type: DataTypes.ENUM('text', 'news', 'announcement'), allowNull: false, defaultValue: 'text' },
    imageUrl: { type: DataTypes.STRING, allowNull: true },
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    isPublished: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  },
  { sequelize, tableName: 'cms_blocks' }
);

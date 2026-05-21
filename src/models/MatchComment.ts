import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface MatchCommentAttributes {
  id: number;
  matchId: number;
  authorName?: string | null;
  body: string;
}

type MatchCommentCreationAttributes = Optional<MatchCommentAttributes, 'id' | 'authorName'>;

export class MatchComment extends Model<MatchCommentAttributes, MatchCommentCreationAttributes> implements MatchCommentAttributes {
  declare id: number;
  declare matchId: number;
  declare authorName: string | null;
  declare body: string;
}

MatchComment.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    matchId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    authorName: { type: DataTypes.STRING(60), allowNull: true },
    body: { type: DataTypes.STRING(255), allowNull: false }
  },
  {
    sequelize,
    tableName: 'match_comments',
    indexes: [{ fields: ['matchId'] }]
  }
);

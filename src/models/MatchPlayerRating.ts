import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface MatchPlayerRatingAttributes {
  id: number;
  matchId: number;
  playerId: number;
  voterKey: string;
  rating: number;
}

type MatchPlayerRatingCreationAttributes = Optional<MatchPlayerRatingAttributes, 'id'>;

export class MatchPlayerRating extends Model<MatchPlayerRatingAttributes, MatchPlayerRatingCreationAttributes> implements MatchPlayerRatingAttributes {
  declare id: number;
  declare matchId: number;
  declare playerId: number;
  declare voterKey: string;
  declare rating: number;
}

MatchPlayerRating.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    matchId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    playerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    voterKey: { type: DataTypes.STRING(80), allowNull: false },
    rating: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, validate: { min: 1, max: 10 } }
  },
  {
    sequelize,
    tableName: 'match_player_ratings',
    indexes: [{ unique: true, fields: ['matchId', 'playerId', 'voterKey'] }]
  }
);

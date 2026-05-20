import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface MatchPlayerVoteAttributes {
  id: number;
  matchId: number;
  playerId: number;
  voterKey: string;
}

type MatchPlayerVoteCreationAttributes = Optional<MatchPlayerVoteAttributes, 'id'>;

export class MatchPlayerVote extends Model<MatchPlayerVoteAttributes, MatchPlayerVoteCreationAttributes> implements MatchPlayerVoteAttributes {
  declare id: number;
  declare matchId: number;
  declare playerId: number;
  declare voterKey: string;
}

MatchPlayerVote.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    matchId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    playerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    voterKey: { type: DataTypes.STRING(80), allowNull: false }
  },
  {
    sequelize,
    tableName: 'match_player_votes',
    indexes: [{ unique: true, fields: ['matchId', 'voterKey'] }]
  }
);

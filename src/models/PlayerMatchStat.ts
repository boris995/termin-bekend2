import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface PlayerMatchStatAttributes {
  id: number;
  matchId: number;
  playerId: number;
  teamId: number;
  goals: number;
  assists: number;
}

type PlayerMatchStatCreationAttributes = Optional<PlayerMatchStatAttributes, 'id' | 'goals' | 'assists'>;

export class PlayerMatchStat extends Model<PlayerMatchStatAttributes, PlayerMatchStatCreationAttributes> implements PlayerMatchStatAttributes {
  declare id: number;
  declare matchId: number;
  declare playerId: number;
  declare teamId: number;
  declare goals: number;
  declare assists: number;
}

PlayerMatchStat.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    matchId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    playerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    teamId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    goals: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
    assists: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 }
  },
  { sequelize, tableName: 'player_match_stats' }
);

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import type { Player } from './Player';
import type { Season } from './Season';
import type { Team } from './Team';

interface PlayerSeasonAttributes {
  id: number;
  playerId: number;
  seasonId: number;
  teamId: number;
  showOnHome: boolean;
}

type PlayerSeasonCreationAttributes = Optional<PlayerSeasonAttributes, 'id' | 'showOnHome'>;

export class PlayerSeason extends Model<PlayerSeasonAttributes, PlayerSeasonCreationAttributes> implements PlayerSeasonAttributes {
  declare id: number;
  declare playerId: number;
  declare seasonId: number;
  declare teamId: number;
  declare showOnHome: boolean;
  declare player?: Player;
  declare season?: Season;
  declare team?: Team;
}

PlayerSeason.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    playerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    seasonId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    teamId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    showOnHome: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  },
  {
    sequelize,
    tableName: 'player_seasons',
    indexes: [{ unique: true, fields: ['playerId', 'seasonId'] }]
  }
);

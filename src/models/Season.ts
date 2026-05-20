import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type SeasonStatus = 'active' | 'completed';

interface SeasonAttributes {
  id: number;
  number: number;
  name: string;
  winsToWinSeason: number;
  status: SeasonStatus;
  winnerTeamId?: number | null;
  startedAt: Date;
  finishedAt?: Date | null;
}

type SeasonCreationAttributes = Optional<SeasonAttributes, 'id' | 'status' | 'winnerTeamId' | 'startedAt' | 'finishedAt'>;

export class Season extends Model<SeasonAttributes, SeasonCreationAttributes> implements SeasonAttributes {
  declare id: number;
  declare number: number;
  declare name: string;
  declare winsToWinSeason: number;
  declare status: SeasonStatus;
  declare winnerTeamId: number | null;
  declare startedAt: Date;
  declare finishedAt: Date | null;
}

Season.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    number: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    winsToWinSeason: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 8, validate: { min: 1 } },
    status: { type: DataTypes.ENUM('active', 'completed'), allowNull: false, defaultValue: 'active' },
    winnerTeamId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    startedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    finishedAt: { type: DataTypes.DATE, allowNull: true }
  },
  { sequelize, tableName: 'seasons' }
);

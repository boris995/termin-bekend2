import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type NextMatchStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';

interface NextMatchAttributes {
  id: number;
  seasonId: number;
  homeTeamId: number;
  awayTeamId: number;
  scheduledAt: Date;
  venue?: string | null;
  note?: string | null;
  status: NextMatchStatus;
  startedAt?: Date | null;
  endedAt?: Date | null;
  matchId?: number | null;
}

type NextMatchCreationAttributes = Optional<NextMatchAttributes, 'id' | 'venue' | 'note' | 'status' | 'startedAt' | 'endedAt' | 'matchId'>;

export class NextMatch extends Model<NextMatchAttributes, NextMatchCreationAttributes> implements NextMatchAttributes {
  declare id: number;
  declare seasonId: number;
  declare homeTeamId: number;
  declare awayTeamId: number;
  declare scheduledAt: Date;
  declare venue: string | null;
  declare note: string | null;
  declare status: NextMatchStatus;
  declare startedAt: Date | null;
  declare endedAt: Date | null;
  declare matchId: number | null;
}

NextMatch.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    seasonId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    homeTeamId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    awayTeamId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    scheduledAt: { type: DataTypes.DATE, allowNull: false },
    venue: { type: DataTypes.STRING, allowNull: true },
    note: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.ENUM('scheduled', 'live', 'completed', 'cancelled'), allowNull: false, defaultValue: 'scheduled' },
    startedAt: { type: DataTypes.DATE, allowNull: true },
    endedAt: { type: DataTypes.DATE, allowNull: true },
    matchId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true }
  },
  { sequelize, tableName: 'next_matches' }
);

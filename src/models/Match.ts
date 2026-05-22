import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type MatchStatus = 'played' | 'cancelled';
export type MatchTimelineEventType = 'goal' | 'yellow-card' | 'red-card' | 'note';

export interface MatchTimelineEvent {
  minute: string;
  type: MatchTimelineEventType;
  teamId?: number | null;
  playerId?: number | null;
  assistPlayerId?: number | null;
  description?: string | null;
}

interface MatchAttributes {
  id: number;
  seasonId: number;
  homeTeamId: number;
  awayTeamId: number;
  homeScore: number;
  awayScore: number;
  winnerTeamId?: number | null;
  matchNumber: number;
  playedAt: Date;
  startedAt?: Date | null;
  endedAt?: Date | null;
  votingEnabled: boolean;
  reportSummary?: string | null;
  timelineEvents?: MatchTimelineEvent[] | null;
  status: MatchStatus;
}

type MatchCreationAttributes = Optional<MatchAttributes, 'id' | 'winnerTeamId' | 'playedAt' | 'startedAt' | 'endedAt' | 'votingEnabled' | 'reportSummary' | 'timelineEvents' | 'status'>;

export class Match extends Model<MatchAttributes, MatchCreationAttributes> implements MatchAttributes {
  declare id: number;
  declare seasonId: number;
  declare homeTeamId: number;
  declare awayTeamId: number;
  declare homeScore: number;
  declare awayScore: number;
  declare winnerTeamId: number | null;
  declare matchNumber: number;
  declare playedAt: Date;
  declare startedAt: Date | null;
  declare endedAt: Date | null;
  declare votingEnabled: boolean;
  declare reportSummary: string | null;
  declare timelineEvents: MatchTimelineEvent[] | null;
  declare status: MatchStatus;
}

Match.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    seasonId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    homeTeamId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    awayTeamId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    homeScore: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    awayScore: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    winnerTeamId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    matchNumber: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    playedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    startedAt: { type: DataTypes.DATE, allowNull: true },
    endedAt: { type: DataTypes.DATE, allowNull: true },
    votingEnabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    reportSummary: { type: DataTypes.TEXT, allowNull: true },
    timelineEvents: { type: DataTypes.JSON, allowNull: true },
    status: { type: DataTypes.ENUM('played', 'cancelled'), allowNull: false, defaultValue: 'played' }
  },
  {
    sequelize,
    tableName: 'matches',
    indexes: [{ unique: true, fields: ['seasonId', 'matchNumber'] }]
  }
);

import { AppSetting } from './AppSetting';
import { AuditLog } from './AuditLog';
import { Match } from './Match';
import { MatchPlayerRating } from './MatchPlayerRating';
import { MatchPlayerVote } from './MatchPlayerVote';
import { CmsBlock } from './CmsBlock';
import { NextMatch } from './NextMatch';
import { Player } from './Player';
import { PlayerMatchStat } from './PlayerMatchStat';
import { Season } from './Season';
import { Team } from './Team';
import { User } from './User';

User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Season.hasMany(Team, { foreignKey: 'seasonId', as: 'teams', onDelete: 'CASCADE' });
Team.belongsTo(Season, { foreignKey: 'seasonId', as: 'season' });

Season.hasMany(Player, { foreignKey: 'seasonId', as: 'players', onDelete: 'CASCADE' });
Player.belongsTo(Season, { foreignKey: 'seasonId', as: 'season' });

Team.hasMany(Player, { foreignKey: 'teamId', as: 'players', onDelete: 'CASCADE' });
Player.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

Season.hasMany(Match, { foreignKey: 'seasonId', as: 'matches', onDelete: 'CASCADE' });
Match.belongsTo(Season, { foreignKey: 'seasonId', as: 'season' });

Team.hasMany(Match, { foreignKey: 'homeTeamId', as: 'homeMatches' });
Team.hasMany(Match, { foreignKey: 'awayTeamId', as: 'awayMatches' });
Match.belongsTo(Team, { foreignKey: 'homeTeamId', as: 'homeTeam' });
Match.belongsTo(Team, { foreignKey: 'awayTeamId', as: 'awayTeam' });
Match.belongsTo(Team, { foreignKey: 'winnerTeamId', as: 'winnerTeam' });
Season.belongsTo(Team, { foreignKey: 'winnerTeamId', as: 'winnerTeam' });

Season.hasMany(NextMatch, { foreignKey: 'seasonId', as: 'nextMatches', onDelete: 'CASCADE' });
NextMatch.belongsTo(Season, { foreignKey: 'seasonId', as: 'season' });
NextMatch.belongsTo(Team, { foreignKey: 'homeTeamId', as: 'homeTeam' });
NextMatch.belongsTo(Team, { foreignKey: 'awayTeamId', as: 'awayTeam' });
NextMatch.belongsTo(Match, { foreignKey: 'matchId', as: 'match' });

Match.hasMany(PlayerMatchStat, { foreignKey: 'matchId', as: 'playerStats', onDelete: 'CASCADE' });
PlayerMatchStat.belongsTo(Match, { foreignKey: 'matchId', as: 'match' });
Player.hasMany(PlayerMatchStat, { foreignKey: 'playerId', as: 'matchStats', onDelete: 'CASCADE' });
PlayerMatchStat.belongsTo(Player, { foreignKey: 'playerId', as: 'player' });
Team.hasMany(PlayerMatchStat, { foreignKey: 'teamId', as: 'playerMatchStats' });
PlayerMatchStat.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

Match.hasMany(MatchPlayerRating, { foreignKey: 'matchId', as: 'ratings', onDelete: 'CASCADE' });
MatchPlayerRating.belongsTo(Match, { foreignKey: 'matchId', as: 'match' });
Player.hasMany(MatchPlayerRating, { foreignKey: 'playerId', as: 'matchRatings', onDelete: 'CASCADE' });
MatchPlayerRating.belongsTo(Player, { foreignKey: 'playerId', as: 'player' });

Match.hasMany(MatchPlayerVote, { foreignKey: 'matchId', as: 'playerVotes', onDelete: 'CASCADE' });
MatchPlayerVote.belongsTo(Match, { foreignKey: 'matchId', as: 'match' });
Player.hasMany(MatchPlayerVote, { foreignKey: 'playerId', as: 'playerVotes', onDelete: 'CASCADE' });
MatchPlayerVote.belongsTo(Player, { foreignKey: 'playerId', as: 'player' });

export { AppSetting, AuditLog, CmsBlock, Match, MatchPlayerRating, MatchPlayerVote, NextMatch, Player, PlayerMatchStat, Season, Team, User };

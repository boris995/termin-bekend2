import { Request, Response } from 'express';
import { Match, Player, Season, Team } from '../models';
import { fail, ok } from '../utils/http';

export const getSeasonDashboard = async (req: Request, res: Response) => {
  const seasonId = Number(req.params.seasonId);
  const season = await Season.findByPk(seasonId);
  if (!season) return fail(res, 'Sezona nije pronađena.', 404);

  const teams = await Team.findAll({ where: { seasonId }, order: [['id', 'ASC']] });
  const teamStats = await Promise.all(
    teams.map(async (team) => {
      const wins = await Match.count({ where: { seasonId, winnerTeamId: team.id, status: 'played' } });
      const played = await Match.count({ where: { seasonId, status: 'played' } });
      return { ...team.toJSON(), wins, losses: played - wins };
    })
  );

  const topScorers = await Player.findAll({ where: { seasonId }, include: ['team'], order: [['goals', 'DESC']], limit: 5 });
  const topAssists = await Player.findAll({ where: { seasonId }, include: ['team'], order: [['assists', 'DESC']], limit: 5 });
  const totalMatchesPlayed = await Match.count({ where: { seasonId, status: 'played' } });

  return ok(res, { season, teams: teamStats, topScorers, topAssists, totalMatchesPlayed });
};

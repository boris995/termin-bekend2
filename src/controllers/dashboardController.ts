import { Request, Response } from 'express';
import { Match, MatchPlayerRating, Player, PlayerSeason, Season, Team } from '../models';
import { fail, ok } from '../utils/http';

const audienceRatingsFor = async (playerIds: number[]) => {
  const ratings = await MatchPlayerRating.findAll({ where: { playerId: playerIds } });
  return ratings.reduce<Record<number, { count: number; total: number; average: number }>>((acc, item) => {
    const current = acc[item.playerId] || { count: 0, total: 0, average: 0 };
    current.count += 1;
    current.total += item.rating;
    current.average = Number((current.total / current.count).toFixed(1));
    acc[item.playerId] = current;
    return acc;
  }, {});
};

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

  const playerLinks = await PlayerSeason.findAll({ where: { seasonId }, include: ['player', 'team'] });
  const audienceRatings = await audienceRatingsFor(playerLinks.map((link) => link.player!.id));
  const players = playerLinks.map((link) => ({
    ...link.player!.toJSON(),
    seasonId: link.seasonId,
    teamId: link.teamId,
    team: link.team,
    audienceRating: audienceRatings[link.player!.id]?.average || null,
    audienceRatingCount: audienceRatings[link.player!.id]?.count || 0
  }));
  const topScorers = [...players].sort((a, b) => Number(b.goals || 0) - Number(a.goals || 0)).slice(0, 5);
  const topAssists = [...players].sort((a, b) => Number(b.assists || 0) - Number(a.assists || 0)).slice(0, 5);
  const totalMatchesPlayed = await Match.count({ where: { seasonId, status: 'played' } });

  return ok(res, { season, teams: teamStats, topScorers, topAssists, totalMatchesPlayed });
};

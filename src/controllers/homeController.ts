import { Op } from 'sequelize';
import { Request, Response } from 'express';
import { AppSetting, CmsBlock, Match, MatchPlayerRating, NextMatch, Player, PlayerSeason, Season, Team } from '../models';
import { activateDueNextMatches } from '../services/matchService';
import { ok } from '../utils/http';

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

export const getHome = async (req: Request, res: Response) => {
  await activateDueNextMatches();
  const requestedSeasonId = req.query.seasonId ? Number(req.query.seasonId) : null;
  const activeSeason = requestedSeasonId
    ? await Season.findByPk(requestedSeasonId)
    : await Season.findOne({ where: { status: 'active' }, order: [['number', 'DESC']] });
  const seasonId = activeSeason?.id;

  const lastMatches = seasonId
    ? await Match.findAll({
        where: { seasonId, status: 'played' },
        include: ['homeTeam', 'awayTeam', 'winnerTeam', { association: 'playerStats', include: ['player', 'team'] }],
        order: [['playedAt', 'DESC'], ['matchNumber', 'DESC']],
        limit: 3
      })
    : [];

  const lastMatch = lastMatches[0] || null;

  const liveMatch = seasonId
    ? await NextMatch.findOne({
        where: { seasonId, status: 'live' },
        include: ['homeTeam', 'awayTeam', 'season', 'match'],
        order: [['startedAt', 'DESC']]
      })
    : null;

  const nextMatch = liveMatch || (seasonId
    ? await NextMatch.findOne({
        where: { seasonId, status: 'scheduled', scheduledAt: { [Op.gte]: new Date() } },
        include: ['homeTeam', 'awayTeam', 'season', 'match'],
        order: [['scheduledAt', 'ASC']]
      })
    : null);

  const contentBlocks = await CmsBlock.findAll({
    where: { isPublished: true },
    order: [
      ['sortOrder', 'ASC'],
      ['createdAt', 'DESC']
    ]
  });

  const teams = seasonId ? await Team.findAll({ where: { seasonId }, order: [['id', 'ASC']] }) : [];
  const homeFeaturedLinks = seasonId
    ? await PlayerSeason.findAll({
        where: { seasonId, showOnHome: true },
        include: ['player', 'team'],
        order: [['teamId', 'ASC'], [{ model: Player, as: 'player' }, 'shirtNumber', 'ASC']]
      })
    : [];
  const audienceRatings = await audienceRatingsFor(homeFeaturedLinks.map((link) => link.player!.id));
  const homeFeaturedPlayers = homeFeaturedLinks.map((link) => ({
    ...link.player!.toJSON(),
    seasonId: link.seasonId,
    teamId: link.teamId,
    team: link.team,
    showOnHome: link.showOnHome,
    audienceRating: audienceRatings[link.player!.id]?.average || null,
    audienceRatingCount: audienceRatings[link.player!.id]?.count || 0
  }));
  const [cardDesign, siteDesign] = await Promise.all([
    AppSetting.findByPk('cardDesign'),
    AppSetting.findByPk('siteDesign')
  ]);

  return ok(res, {
    season: activeSeason,
    teams,
    lastMatch,
    lastMatches,
    nextMatch,
    homeFeaturedPlayers,
    contentBlocks,
    settings: {
      cardDesign: cardDesign?.value || 'standard',
      siteDesign: siteDesign?.value || 'classic'
    }
  });
};

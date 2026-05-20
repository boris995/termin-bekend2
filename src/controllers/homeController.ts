import { Op } from 'sequelize';
import { Request, Response } from 'express';
import { CmsBlock, Match, NextMatch, Player, Season, Team } from '../models';
import { activateDueNextMatches } from '../services/matchService';
import { ok } from '../utils/http';

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
  const homeFeaturedPlayers = seasonId
    ? await Player.findAll({ where: { seasonId, showOnHome: true }, include: ['team'], order: [['teamId', 'ASC'], ['shirtNumber', 'ASC']] })
    : [];

  return ok(res, { season: activeSeason, teams, lastMatch, lastMatches, nextMatch, homeFeaturedPlayers, contentBlocks });
};

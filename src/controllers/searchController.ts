import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Match, Player, Season, Team } from '../models';
import { ok } from '../utils/http';

const normalizeQuery = (value: unknown) => String(value || '').trim();

export const searchPublicContent = async (req: Request, res: Response) => {
  const query = normalizeQuery(req.query.q);
  if (query.length < 2) {
    return ok(res, { query, players: [], teams: [], seasons: [], matches: [] });
  }

  const like = `%${query}%`;
  const numericQuery = Number(query);
  const numericMatch = Number.isFinite(numericQuery) && numericQuery > 0 ? numericQuery : null;

  const [players, teams, seasons, matches] = await Promise.all([
    Player.findAll({
      where: {
        [Op.or]: [
          { firstName: { [Op.like]: like } },
          { lastName: { [Op.like]: like } },
          { nickname: { [Op.like]: like } }
        ]
      },
      include: ['team', 'season'],
      limit: 12,
      order: [['goals', 'DESC'], ['assists', 'DESC']]
    }),
    Team.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: like } },
          { shortName: { [Op.like]: like } },
          { representativeName: { [Op.like]: like } }
        ]
      },
      include: ['season'],
      limit: 12,
      order: [['name', 'ASC']]
    }),
    Season.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: like } },
          ...(numericMatch ? [{ number: numericMatch }] : [])
        ]
      },
      include: ['winnerTeam'],
      limit: 12,
      order: [['number', 'DESC']]
    }),
    Match.findAll({
      where: numericMatch ? { [Op.or]: [{ matchNumber: numericMatch }, { homeScore: numericMatch }, { awayScore: numericMatch }] } : undefined,
      include: [
        { association: 'homeTeam', where: numericMatch ? undefined : { [Op.or]: [{ name: { [Op.like]: like } }, { shortName: { [Op.like]: like } }] }, required: false },
        { association: 'awayTeam', where: numericMatch ? undefined : { [Op.or]: [{ name: { [Op.like]: like } }, { shortName: { [Op.like]: like } }] }, required: false },
        'winnerTeam'
      ],
      limit: 12,
      order: [['playedAt', 'DESC']]
    })
  ]);

  const filteredMatches = numericMatch
    ? matches
    : matches.filter((match) => {
      const item = match as unknown as { homeTeam?: Team | null; awayTeam?: Team | null };
      return item.homeTeam || item.awayTeam;
    });

  return ok(res, { query, players, teams, seasons, matches: filteredMatches });
};

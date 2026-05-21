import { Request, Response } from 'express';
import { MatchPlayerRating, Player, PlayerMatchStat, PlayerSeason, Team } from '../models';
import { fail, ok } from '../utils/http';

const ratingKeys = ['pac', 'sho', 'pas', 'dri', 'def', 'phy'] as const;

const calculateOverall = (ratings: Record<(typeof ratingKeys)[number], number>) =>
  Math.round(ratingKeys.reduce((sum, key) => sum + Number(ratings[key]), 0) / ratingKeys.length);

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

const playerJson = (
  link: PlayerSeason,
  audienceRatings: Record<number, { count: number; total: number; average: number }>
) => ({
  ...link.player!.toJSON(),
  seasonId: link.seasonId,
  teamId: link.teamId,
  team: link.team,
  showOnHome: link.showOnHome,
  audienceRating: audienceRatings[link.player!.id]?.average || null,
  audienceRatingCount: audienceRatings[link.player!.id]?.count || 0
});

export const getSeasonPlayers = async (req: Request, res: Response) => {
  const links = await PlayerSeason.findAll({
    where: { seasonId: req.params.seasonId },
    include: ['player', 'team'],
    order: [['teamId', 'ASC'], [{ model: Player, as: 'player' }, 'shirtNumber', 'ASC']]
  });
  const audienceRatings = await audienceRatingsFor(links.map((link) => link.player!.id));
  return ok(res, links.map((link) => playerJson(link, audienceRatings)));
};

export const getTeamPlayers = async (req: Request, res: Response) => {
  const links = await PlayerSeason.findAll({
    where: { teamId: req.params.teamId },
    include: ['player', 'team'],
    order: [[{ model: Player, as: 'player' }, 'shirtNumber', 'ASC']]
  });
  const audienceRatings = await audienceRatingsFor(links.map((link) => link.player!.id));
  return ok(res, links.map((link) => playerJson(link, audienceRatings)));
};

export const getPlayer = async (req: Request, res: Response) => {
  const player = await Player.findByPk(Number(req.params.id), { include: ['team'] });
  if (!player) return fail(res, 'Igrac nije pronadjen.', 404);
  const matchStats = await PlayerMatchStat.findAll({
    where: { playerId: player.id },
    include: [
      'team',
      { association: 'match', include: ['homeTeam', 'awayTeam', 'winnerTeam'] }
    ],
    order: [['id', 'DESC']],
    limit: 8
  });
  const audienceRatings = await audienceRatingsFor([player.id]);
  return ok(res, {
    ...player.toJSON(),
    audienceRating: audienceRatings[player.id]?.average || null,
    audienceRatingCount: audienceRatings[player.id]?.count || 0,
    matchStats
  });
};

export const createPlayer = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      nickname,
      position,
      shirtNumber,
      teamId,
      seasonId,
      cardImageUrl,
      cardImageX = 0,
      cardImageY = 0,
      cardImageScale = 1,
      galleryImages = [],
      showOnHome = false,
      pac = 50,
      sho = 50,
      pas = 50,
      dri = 50,
      def = 50,
      phy = 50
    } = req.body;
    const team = await Team.findByPk(teamId);
    if (!team || team.seasonId !== Number(seasonId)) return fail(res, 'Igrac mora pripadati ekipi iz izabrane sezone.');

    const overallRating = calculateOverall({ pac, sho, pas, dri, def, phy });
    const player = await Player.create({
      firstName,
      lastName,
      nickname,
      position,
      shirtNumber,
      teamId,
      seasonId,
      cardImageUrl,
      cardImageX,
      cardImageY,
      cardImageScale,
      galleryImages,
      showOnHome,
      pac,
      sho,
      pas,
      dri,
      def,
      phy,
      overallRating
    });
    await PlayerSeason.create({ playerId: player.id, seasonId, teamId, showOnHome });
    return ok(res, player, 201);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Igrac nije kreiran.');
  }
};

export const updatePlayer = async (req: Request, res: Response) => {
  const player = await Player.findByPk(Number(req.params.id));
  if (!player) return fail(res, 'Igrac nije pronadjen.', 404);

  const next = { ...req.body };
  if (ratingKeys.some((key) => next[key] !== undefined)) {
    next.overallRating = calculateOverall({
      pac: next.pac ?? player.pac,
      sho: next.sho ?? player.sho,
      pas: next.pas ?? player.pas,
      dri: next.dri ?? player.dri,
      def: next.def ?? player.def,
      phy: next.phy ?? player.phy
    });
  }

  await player.update(next);
  if (next.seasonId && next.teamId) {
    await PlayerSeason.upsert({ playerId: player.id, seasonId: Number(next.seasonId), teamId: Number(next.teamId), showOnHome: next.showOnHome ?? player.showOnHome });
  }
  return ok(res, player);
};

export const deletePlayer = async (req: Request, res: Response) => {
  const player = await Player.findByPk(Number(req.params.id));
  if (!player) return fail(res, 'Igrac nije pronadjen.', 404);
  await player.destroy();
  return ok(res, { id: Number(req.params.id) });
};

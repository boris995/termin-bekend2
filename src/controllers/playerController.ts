import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Player, PlayerMatchStat, Team } from '../models';
import { logAdminAction } from '../services/auditService';
import { fail, ok } from '../utils/http';

const ratingKeys = ['pac', 'sho', 'pas', 'dri', 'def', 'phy'] as const;

const calculateOverall = (ratings: Record<(typeof ratingKeys)[number], number>) =>
  Math.round(ratingKeys.reduce((sum, key) => sum + Number(ratings[key]), 0) / ratingKeys.length);

export const getSeasonPlayers = async (req: Request, res: Response) => {
  const players = await Player.findAll({ where: { seasonId: req.params.seasonId }, include: ['team'], order: [['teamId', 'ASC'], ['shirtNumber', 'ASC']] });
  return ok(res, players);
};

export const getTeamPlayers = async (req: Request, res: Response) => {
  const players = await Player.findAll({ where: { teamId: req.params.teamId }, include: ['team'], order: [['shirtNumber', 'ASC']] });
  return ok(res, players);
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
  return ok(res, { ...player.toJSON(), matchStats });
};

export const createPlayer = async (req: AuthRequest, res: Response) => {
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
    await logAdminAction(req, { action: 'create', entityType: 'player', entityId: player.id, label: `${player.firstName} ${player.lastName}`, metadata: { seasonId, teamId } });
    return ok(res, player, 201);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Igrac nije kreiran.');
  }
};

export const updatePlayer = async (req: AuthRequest, res: Response) => {
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
  await logAdminAction(req, { action: 'update', entityType: 'player', entityId: player.id, label: `${player.firstName} ${player.lastName}`, metadata: { seasonId: player.seasonId, teamId: player.teamId } });
  return ok(res, player);
};

export const deletePlayer = async (req: AuthRequest, res: Response) => {
  const player = await Player.findByPk(Number(req.params.id));
  if (!player) return fail(res, 'Igrac nije pronadjen.', 404);
  const label = `${player.firstName} ${player.lastName}`;
  const metadata = { seasonId: player.seasonId, teamId: player.teamId };
  await player.destroy();
  await logAdminAction(req, { action: 'delete', entityType: 'player', entityId: Number(req.params.id), label, metadata });
  return ok(res, { id: Number(req.params.id) });
};

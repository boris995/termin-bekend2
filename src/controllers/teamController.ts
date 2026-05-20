import { Request, Response } from 'express';
import { Season, Team } from '../models';
import { fail, ok } from '../utils/http';

export const getTeams = async (req: Request, res: Response) => {
  const teams = await Team.findAll({ where: { seasonId: req.params.seasonId }, order: [['id', 'ASC']] });
  return ok(res, teams);
};

export const createTeam = async (req: Request, res: Response) => {
  try {
    const seasonId = Number(req.params.seasonId);
    const season = await Season.findByPk(seasonId);
    if (!season) return fail(res, 'Sezona nije pronadjena.', 404);
    const count = await Team.count({ where: { seasonId } });
    if (count >= 2) return fail(res, 'Sezona vec ima maksimalan broj ekipa (2).');

    const { name, shortName, logoUrl, representativeName, primaryColor } = req.body;
    if (!name || !shortName) return fail(res, 'Naziv i kratki naziv ekipe su obavezni.');
    const team = await Team.create({ name, shortName, logoUrl, representativeName, primaryColor, seasonId });
    return ok(res, team, 201);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Ekipa nije kreirana.');
  }
};

export const updateTeam = async (req: Request, res: Response) => {
  const team = await Team.findByPk(Number(req.params.id));
  if (!team) return fail(res, 'Ekipa nije pronadjena.', 404);
  await team.update(req.body);
  return ok(res, team);
};

export const deleteTeam = async (req: Request, res: Response) => {
  const team = await Team.findByPk(Number(req.params.id));
  if (!team) return fail(res, 'Ekipa nije pronadjena.', 404);
  await team.destroy();
  return ok(res, { id: Number(req.params.id) });
};

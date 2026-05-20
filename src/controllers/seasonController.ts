import { Request, Response } from 'express';
import { sequelize } from '../config/database';
import { Season } from '../models';
import { fail, ok } from '../utils/http';

export const getSeasons = async (_req: Request, res: Response) => {
  const seasons = await Season.findAll({ include: [{ association: 'winnerTeam' }], order: [['number', 'ASC']] });
  return ok(res, seasons);
};

export const getSeason = async (req: Request, res: Response) => {
  const season = await Season.findByPk(Number(req.params.id), { include: ['teams', 'winnerTeam'] });
  if (!season) return fail(res, 'Sezona nije pronadjena.', 404);
  return ok(res, season);
};

export const createSeason = async (req: Request, res: Response) => {
  try {
    const season = await sequelize.transaction(async (transaction) => {
      const lastSeason = await Season.findOne({ order: [['number', 'DESC']], transaction });
      const number = Number(req.body.number || (lastSeason ? lastSeason.number + 1 : 1));
      const name = String(req.body.name || '').trim() || `Sezona ${number}`;
      const winsToWinSeason = Number(req.body.winsToWinSeason || 8);
      if (winsToWinSeason <= 0) throw new Error('Cilj pobjeda mora biti pozitivan broj.');
      const status = req.body.status || 'active';
      if (status === 'active') await Season.update({ status: 'completed' }, { where: { status: 'active' }, transaction });
      return Season.create({ number, name, winsToWinSeason, status }, { transaction });
    });
    return ok(res, season, 201);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Sezona nije kreirana.');
  }
};

export const updateSeason = async (req: Request, res: Response) => {
  try {
    const updated = await sequelize.transaction(async (transaction) => {
      const season = await Season.findByPk(Number(req.params.id), { transaction });
      if (!season) throw new Error('Sezona nije pronadjena.');
      const nextNumber = Number(req.body.number || season.number);
      const payload = {
        ...req.body,
        name: req.body.name === '' || req.body.name === null || req.body.name === undefined ? `Sezona ${nextNumber}` : req.body.name
      };
      if (payload.status === 'active') {
        await Season.update({ status: 'completed' }, { where: { status: 'active' }, transaction });
      }
      await season.update(payload, { transaction });
      return season;
    });
    return ok(res, updated);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Sezona nije izmijenjena.', error instanceof Error && error.message.includes('pronadjena') ? 404 : 400);
  }
};

export const deleteSeason = async (req: Request, res: Response) => {
  const season = await Season.findByPk(Number(req.params.id));
  if (!season) return fail(res, 'Sezona nije pronadjena.', 404);
  await season.destroy();
  return ok(res, { id: Number(req.params.id) });
};

export const getActiveSeason = async (_req: Request, res: Response) => {
  const season = await Season.findOne({ where: { status: 'active' }, include: ['teams'], order: [['number', 'DESC']] });
  return ok(res, season);
};

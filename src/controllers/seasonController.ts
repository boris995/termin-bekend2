import { Request, Response } from 'express';
import { sequelize } from '../config/database';
import { AuthRequest } from '../middleware/authMiddleware';
import { Match, MatchPlayerRating, Player, Season, Team } from '../models';
import { logAdminAction } from '../services/auditService';
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

export const createSeason = async (req: AuthRequest, res: Response) => {
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
    await logAdminAction(req, { action: 'create', entityType: 'season', entityId: season.id, label: season.name });
    return ok(res, season, 201);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Sezona nije kreirana.');
  }
};

export const updateSeason = async (req: AuthRequest, res: Response) => {
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
    await logAdminAction(req, { action: 'update', entityType: 'season', entityId: updated.id, label: updated.name });
    return ok(res, updated);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Sezona nije izmijenjena.', error instanceof Error && error.message.includes('pronadjena') ? 404 : 400);
  }
};

export const deleteSeason = async (req: AuthRequest, res: Response) => {
  const season = await Season.findByPk(Number(req.params.id));
  if (!season) return fail(res, 'Sezona nije pronadjena.', 404);
  const label = season.name;
  await season.destroy();
  await logAdminAction(req, { action: 'delete', entityType: 'season', entityId: Number(req.params.id), label });
  return ok(res, { id: Number(req.params.id) });
};

export const getActiveSeason = async (_req: Request, res: Response) => {
  const season = await Season.findOne({ where: { status: 'active' }, include: ['teams'], order: [['number', 'DESC']] });
  return ok(res, season);
};

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const formatDate = (value?: Date | string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('sr-Latn-BA', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

export const exportSeasonReport = async (req: Request, res: Response) => {
  const seasonId = Number(req.params.id);
  const season = await Season.findByPk(seasonId, { include: ['winnerTeam'] });
  if (!season) return fail(res, 'Sezona nije pronadjena.', 404);

  const [teams, players, matches] = await Promise.all([
    Team.findAll({ where: { seasonId }, order: [['name', 'ASC']] }),
    Player.findAll({ where: { seasonId }, include: ['team'], order: [['goals', 'DESC'], ['assists', 'DESC'], ['lastName', 'ASC']] }),
    Match.findAll({ where: { seasonId }, include: ['homeTeam', 'awayTeam', 'winnerTeam'], order: [['matchNumber', 'ASC']] })
  ]);

  const ratings = matches.length
    ? await MatchPlayerRating.findAll({ where: { matchId: matches.map((match) => match.id) }, include: ['player'] })
    : [];
  const ratingSummary = ratings.reduce<Record<number, { total: number; count: number; name: string }>>((acc, rating) => {
    const player = rating.get('player') as Player | undefined;
    const item = acc[rating.playerId] || { total: 0, count: 0, name: player ? `${player.firstName} ${player.lastName}` : `Igrac #${rating.playerId}` };
    item.total += rating.rating;
    item.count += 1;
    acc[rating.playerId] = item;
    return acc;
  }, {});
  const topRated = Object.values(ratingSummary)
    .map((item) => ({ ...item, average: item.total / item.count }))
    .sort((a, b) => b.average - a.average || b.count - a.count)
    .slice(0, 10);

  const totalGoals = matches.reduce((sum, match) => sum + match.homeScore + match.awayScore, 0);
  const rows = {
    teams: teams.map((team) => `<tr><td>${escapeHtml(team.name)}</td><td>${escapeHtml(team.shortName)}</td><td>${escapeHtml(team.representativeName || '-')}</td></tr>`).join(''),
    players: players.map((player) => `<tr><td>${escapeHtml(player.firstName)} ${escapeHtml(player.lastName)}</td><td>${escapeHtml((player.get('team') as Team | undefined)?.shortName || '-')}</td><td>${player.goals}</td><td>${player.assists}</td><td>${player.overallRating}</td></tr>`).join(''),
    matches: matches.map((match) => `<tr><td>${match.matchNumber}</td><td>${escapeHtml((match.get('homeTeam') as Team | undefined)?.shortName || '')}</td><td>${match.homeScore}:${match.awayScore}</td><td>${escapeHtml((match.get('awayTeam') as Team | undefined)?.shortName || '')}</td><td>${escapeHtml((match.get('winnerTeam') as Team | undefined)?.shortName || 'Nerijeseno')}</td><td>${formatDate(match.playedAt)}</td></tr>`).join(''),
    ratings: topRated.map((item, index) => `<tr><td>${index + 1}</td><td>${escapeHtml(item.name)}</td><td>${item.average.toFixed(2)}</td><td>${item.count}</td></tr>`).join('')
  };

  const html = `<!doctype html>
<html lang="bs">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(season.name)} - izvjestaj</title>
  <style>
    body { margin: 0; background: #f4eddd; color: #2d2c27; font-family: Arial, sans-serif; }
    main { max-width: 980px; margin: 0 auto; padding: 32px 18px; }
    h1 { margin: 0; font-size: 34px; text-transform: uppercase; }
    h2 { margin: 28px 0 10px; font-size: 18px; text-transform: uppercase; }
    .meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 22px 0; }
    .box { border: 2px solid #504d43; padding: 12px; background: #ebe4d4; }
    .label { font-size: 11px; text-transform: uppercase; letter-spacing: .12em; color: #8f332d; font-weight: 800; }
    .value { margin-top: 4px; font-size: 22px; font-weight: 900; }
    table { width: 100%; border-collapse: collapse; background: #ebe4d4; border: 2px solid #504d43; }
    th, td { border-bottom: 1px solid rgba(80,77,67,.35); padding: 9px; text-align: left; font-size: 13px; }
    th { color: #8f332d; text-transform: uppercase; font-size: 11px; letter-spacing: .1em; }
    @media print { body { background: white; } main { padding: 0; } }
  </style>
</head>
<body>
  <main>
    <p class="label">Duel Liga - izvjestaj sezone</p>
    <h1>${escapeHtml(season.name)}</h1>
    <section class="meta">
      <div class="box"><div class="label">Status</div><div class="value">${escapeHtml(season.status)}</div></div>
      <div class="box"><div class="label">Cilj pobjeda</div><div class="value">${season.winsToWinSeason}</div></div>
      <div class="box"><div class="label">Mecevi</div><div class="value">${matches.length}</div></div>
      <div class="box"><div class="label">Golovi</div><div class="value">${totalGoals}</div></div>
    </section>
    <h2>Ekipe</h2>
    <table><thead><tr><th>Ekipa</th><th>Kratko</th><th>Predstavnik</th></tr></thead><tbody>${rows.teams || '<tr><td colspan="3">Nema ekipa.</td></tr>'}</tbody></table>
    <h2>Igraci</h2>
    <table><thead><tr><th>Igrac</th><th>Ekipa</th><th>Golovi</th><th>Asistencije</th><th>OVR</th></tr></thead><tbody>${rows.players || '<tr><td colspan="5">Nema igraca.</td></tr>'}</tbody></table>
    <h2>Rezultati</h2>
    <table><thead><tr><th>MD</th><th>Domacin</th><th>Rezultat</th><th>Gost</th><th>Pobjednik</th><th>Datum</th></tr></thead><tbody>${rows.matches || '<tr><td colspan="6">Nema utakmica.</td></tr>'}</tbody></table>
    <h2>Top public ocjene</h2>
    <table><thead><tr><th>#</th><th>Igrac</th><th>Prosjek</th><th>Glasova</th></tr></thead><tbody>${rows.ratings || '<tr><td colspan="4">Nema ocjena publike.</td></tr>'}</tbody></table>
  </main>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(html);
};

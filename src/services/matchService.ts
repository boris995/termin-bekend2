import { Op, Transaction } from 'sequelize';
import { sequelize } from '../config/database';
import { Match, MatchPlayerRating, MatchPlayerVote, NextMatch, PlayerMatchStat, Season, Team } from '../models';
import type { MatchTimelineEvent } from '../models/Match';
import { deleteStatsForMatch, getPlayersFromMatch, recalculatePlayers, validatePlayersBelongToSeason } from './statsService';

export interface PlayerStatInput {
  playerId: number;
  teamId: number;
  goals?: number;
  assists?: number;
}

export interface MatchInput {
  seasonId: number;
  homeTeamId: number;
  awayTeamId: number;
  homeScore: number;
  awayScore: number;
  playedAt?: Date;
  startedAt?: Date;
  endedAt?: Date;
  votingEnabled?: boolean;
  reportSummary?: string | null;
  timelineEvents?: MatchTimelineEvent[];
  playerStats?: PlayerStatInput[];
}

const matchInclude = ['homeTeam', 'awayTeam', 'winnerTeam', { association: 'playerStats', include: ['player', 'team'] }];

const winnerFromScore = (input: MatchInput) => {
  if (input.homeScore === input.awayScore) return null;
  return input.homeScore > input.awayScore ? input.homeTeamId : input.awayTeamId;
};

const assertValidMatch = async (input: MatchInput, transaction?: Transaction, options: { allowCompletedSeason?: boolean } = {}) => {
  if (input.homeTeamId === input.awayTeamId) throw new Error('Domaca i gostujuca ekipa moraju biti razlicite.');
  if (input.homeScore < 0 || input.awayScore < 0) throw new Error('Rezultat ne moze biti negativan.');

  const season = await Season.findByPk(input.seasonId, { transaction });
  if (!season) throw new Error('Sezona nije pronadjena.');
  if (season.status !== 'active' && !(options.allowCompletedSeason && season.status === 'completed')) throw new Error('Sezona nije aktivna.');

  const teamCount = await Team.count({ where: { seasonId: input.seasonId, id: [input.homeTeamId, input.awayTeamId] }, transaction });
  if (teamCount !== 2) throw new Error('Obje ekipe moraju pripadati izabranoj sezoni.');

  const playerIds = input.playerStats?.map((stat) => Number(stat.playerId)) || [];
  const timelinePlayerIds = (input.timelineEvents || [])
    .flatMap((event) => [event.playerId, event.assistPlayerId])
    .filter((playerId): playerId is number => Boolean(playerId));
  const allPlayerIds = Array.from(new Set([...playerIds, ...timelinePlayerIds]));
  if (allPlayerIds.length && !(await validatePlayersBelongToSeason(input.seasonId, allPlayerIds))) {
    throw new Error('Svi igraci u statistici moraju pripadati izabranoj sezoni.');
  }

  const allowedTeamIds = [Number(input.homeTeamId), Number(input.awayTeamId)];
  const invalidTimelineTeam = (input.timelineEvents || []).some((event) => event.teamId && !allowedTeamIds.includes(Number(event.teamId)));
  if (invalidTimelineTeam) throw new Error('Timeline dogadjaji mogu pripadati samo ekipama iz utakmice.');

  return season;
};

const normalizedTimeline = (events: MatchTimelineEvent[] = []) =>
  events
    .map((event) => ({
      minute: String(event.minute || '').trim(),
      type: event.type || 'goal',
      teamId: event.teamId ? Number(event.teamId) : null,
      playerId: event.playerId ? Number(event.playerId) : null,
      assistPlayerId: event.assistPlayerId ? Number(event.assistPlayerId) : null,
      description: event.description?.trim() || null
    }))
    .filter((event) => event.minute)
    .sort((a, b) => parseInt(a.minute, 10) - parseInt(b.minute, 10));

const saveStats = async (matchId: number, stats: PlayerStatInput[], transaction: Transaction) => {
  if (!stats.length) return;
  await PlayerMatchStat.bulkCreate(
    stats.map((stat) => ({
      matchId,
      playerId: Number(stat.playerId),
      teamId: Number(stat.teamId),
      goals: Number(stat.goals || 0),
      assists: Number(stat.assists || 0)
    })),
    { transaction }
  );
  await recalculatePlayers(stats.map((stat) => Number(stat.playerId)), transaction);
};

export const refreshSeasonState = async (seasonId: number, transaction?: Transaction) => {
  const season = await Season.findByPk(seasonId, { transaction });
  if (!season) return;

  const teams = await Team.findAll({ where: { seasonId }, transaction });
  let winnerTeamId: number | null = null;

  for (const team of teams) {
    const wins = await Match.count({ where: { seasonId, winnerTeamId: team.id, status: 'played' }, transaction });
    if (wins >= season.winsToWinSeason) winnerTeamId = team.id;
  }

  await season.update(
    winnerTeamId
      ? { status: 'completed', winnerTeamId, finishedAt: new Date() }
      : { status: 'active', winnerTeamId: null, finishedAt: null },
    { transaction }
  );
};

const createMatchInTransaction = async (input: MatchInput, transaction: Transaction) => {
  const season = await assertValidMatch(input, transaction);
  const winnerTeamId = winnerFromScore(input);
  const matchNumber = (await Match.count({ where: { seasonId: input.seasonId }, transaction })) + 1;
  const endedAt = input.endedAt || input.playedAt || new Date();

  const match = await Match.create(
    {
      seasonId: input.seasonId,
      homeTeamId: input.homeTeamId,
      awayTeamId: input.awayTeamId,
      homeScore: input.homeScore,
      awayScore: input.awayScore,
      winnerTeamId,
      matchNumber,
      playedAt: endedAt,
      startedAt: input.startedAt || null,
      endedAt,
      votingEnabled: input.votingEnabled ?? true,
      reportSummary: input.reportSummary || null,
      timelineEvents: normalizedTimeline(input.timelineEvents)
    },
    { transaction }
  );

  await saveStats(match.id, input.playerStats || [], transaction);

  const wins = winnerTeamId ? await Match.count({ where: { seasonId: season.id, winnerTeamId, status: 'played' }, transaction }) : 0;
  if (winnerTeamId && wins >= season.winsToWinSeason) {
    await season.update({ status: 'completed', winnerTeamId, finishedAt: new Date() }, { transaction });
  }

  return Match.findByPk(match.id, { include: matchInclude, transaction });
};

export const createMatch = async (input: MatchInput) => sequelize.transaction((transaction) => createMatchInTransaction(input, transaction));

export const updateMatch = async (id: number, input: MatchInput) =>
  sequelize.transaction(async (transaction) => {
    const match = await Match.findByPk(id, { transaction });
    if (!match) throw new Error('Utakmica nije pronadjena.');
    const oldSeasonId = match.seasonId;
    const oldPlayerIds = await getPlayersFromMatch(match.id, transaction);
    await assertValidMatch(input, transaction, { allowCompletedSeason: true });
    const winnerTeamId = winnerFromScore(input);

    await match.update(
      {
        seasonId: input.seasonId,
        homeTeamId: input.homeTeamId,
        awayTeamId: input.awayTeamId,
        homeScore: input.homeScore,
        awayScore: input.awayScore,
        winnerTeamId,
        playedAt: input.playedAt || input.endedAt || match.playedAt,
        startedAt: input.startedAt || null,
        endedAt: input.endedAt || input.playedAt || match.endedAt,
        votingEnabled: input.votingEnabled ?? true,
        reportSummary: input.reportSummary || null,
        timelineEvents: normalizedTimeline(input.timelineEvents)
      },
      { transaction }
    );
    await deleteStatsForMatch(match.id, transaction);

    const stats = input.playerStats || [];
    await saveStats(match.id, stats, transaction);

    await recalculatePlayers([...oldPlayerIds, ...stats.map((stat) => stat.playerId)], transaction);
    if (oldSeasonId !== input.seasonId) await refreshSeasonState(oldSeasonId, transaction);
    await refreshSeasonState(input.seasonId, transaction);
    return Match.findByPk(match.id, { include: matchInclude, transaction });
  });

export const deleteMatch = async (id: number) =>
  sequelize.transaction(async (transaction) => {
    const match = await Match.findByPk(id, { transaction });
    if (!match) throw new Error('Utakmica nije pronadjena.');
    const seasonId = match.seasonId;
    const playerIds = await getPlayersFromMatch(match.id, transaction);
    await match.destroy({ transaction });
    await recalculatePlayers(playerIds, transaction);
    await refreshSeasonState(seasonId, transaction);
  });

export const activateDueNextMatches = async () => {
  const now = new Date();
  await NextMatch.update({ status: 'live', startedAt: now }, { where: { status: 'scheduled', scheduledAt: { [Op.lte]: now } } });
};

export const startNextMatch = async (id: number) => {
  const nextMatch = await NextMatch.findByPk(id);
  if (!nextMatch) throw new Error('Najava utakmice nije pronadjena.');
  if (nextMatch.status === 'completed') throw new Error('Utakmica je vec zavrsena.');
  if (nextMatch.status === 'cancelled') throw new Error('Otkazana utakmica se ne moze pokrenuti.');
  await nextMatch.update({ status: 'live', startedAt: nextMatch.startedAt || new Date() });
  return NextMatch.findByPk(id, { include: ['homeTeam', 'awayTeam', 'season', 'match'] });
};

export const finishNextMatch = async (id: number, input: Omit<MatchInput, 'seasonId' | 'homeTeamId' | 'awayTeamId'>) =>
  sequelize.transaction(async (transaction) => {
    const nextMatch = await NextMatch.findByPk(id, { transaction });
    if (!nextMatch) throw new Error('Najava utakmice nije pronadjena.');
    if (nextMatch.status === 'completed') throw new Error('Utakmica je vec zavrsena.');
    if (nextMatch.status === 'cancelled') throw new Error('Otkazana utakmica se ne moze zavrsiti.');

    const endedAt = input.endedAt || new Date();
    const match = await createMatchInTransaction(
      {
        seasonId: nextMatch.seasonId,
        homeTeamId: nextMatch.homeTeamId,
        awayTeamId: nextMatch.awayTeamId,
        homeScore: input.homeScore,
        awayScore: input.awayScore,
        startedAt: nextMatch.startedAt || nextMatch.scheduledAt,
        endedAt,
        playedAt: endedAt,
        votingEnabled: input.votingEnabled ?? true,
        reportSummary: input.reportSummary || null,
        timelineEvents: normalizedTimeline(input.timelineEvents),
        playerStats: input.playerStats || []
      },
      transaction
    );

    await nextMatch.update({ status: 'completed', endedAt, matchId: match?.id || null }, { transaction });
    return match;
  });

export const getMatchVotingSummary = async (matchId: number) => {
  const [ratings, votes] = await Promise.all([
    MatchPlayerRating.findAll({ where: { matchId } }),
    MatchPlayerVote.findAll({ where: { matchId } })
  ]);

  const ratingSummary = ratings.reduce<Record<number, { count: number; average: number; total: number }>>((acc, item) => {
    const existing = acc[item.playerId] || { count: 0, average: 0, total: 0 };
    existing.count += 1;
    existing.total += item.rating;
    existing.average = Number((existing.total / existing.count).toFixed(2));
    acc[item.playerId] = existing;
    return acc;
  }, {});

  const motmSummary = votes.reduce<Record<number, number>>((acc, item) => {
    acc[item.playerId] = (acc[item.playerId] || 0) + 1;
    return acc;
  }, {});

  return { ratingSummary, motmSummary };
};

const assertParticipant = async (matchId: number, playerId: number) => {
  const count = await PlayerMatchStat.count({ where: { matchId, playerId } });
  if (!count) throw new Error('Glasanje je dozvoljeno samo za igrace koji su ucestvovali u mecu.');
};

export const rateMatchPlayer = async (matchId: number, playerId: number, rating: number, voterKey: string) => {
  const match = await Match.findByPk(matchId);
  if (!match) throw new Error('Utakmica nije pronadjena.');
  if (!match.votingEnabled) throw new Error('Nema glasanja za ovu utakmicu.');
  await assertParticipant(matchId, playerId);
  return MatchPlayerRating.create({ matchId, playerId, rating, voterKey });
};

export const voteMatchPlayer = async (matchId: number, playerId: number, voterKey: string) => {
  await assertParticipant(matchId, playerId);
  return MatchPlayerVote.create({ matchId, playerId, voterKey });
};

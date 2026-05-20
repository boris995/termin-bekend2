import { Op, Transaction } from 'sequelize';
import { Player, PlayerMatchStat } from '../models';

export const recalculatePlayers = async (playerIds: number[], transaction?: Transaction) => {
  const uniqueIds = [...new Set(playerIds)].filter(Boolean);

  await Promise.all(
    uniqueIds.map(async (playerId) => {
      const stats = await PlayerMatchStat.findAll({ where: { playerId }, transaction });
      const totals = stats.reduce(
        (acc, stat) => ({ goals: acc.goals + stat.goals, assists: acc.assists + stat.assists }),
        { goals: 0, assists: 0 }
      );
      await Player.update(totals, { where: { id: playerId }, transaction });
    })
  );
};

export const getPlayersFromMatch = async (matchId: number, transaction?: Transaction) => {
  const stats = await PlayerMatchStat.findAll({ where: { matchId }, transaction });
  return stats.map((stat) => stat.playerId);
};

export const recalculateAllSeasonPlayers = async (seasonId: number, transaction?: Transaction) => {
  const players = await Player.findAll({ where: { seasonId }, attributes: ['id'], transaction });
  await recalculatePlayers(players.map((player) => player.id), transaction);
};

export const deleteStatsForMatch = async (matchId: number, transaction?: Transaction) => {
  await PlayerMatchStat.destroy({ where: { matchId }, transaction });
};

export const validatePlayersBelongToSeason = async (seasonId: number, playerIds: number[]) => {
  const count = await Player.count({ where: { id: { [Op.in]: playerIds }, seasonId } });
  return count === [...new Set(playerIds)].length;
};

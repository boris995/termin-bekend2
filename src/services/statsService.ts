import { Op, Transaction } from 'sequelize';
import { Player, PlayerMatchStat, PlayerSeason } from '../models';

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
  const links = await PlayerSeason.findAll({ where: { seasonId }, attributes: ['playerId'], transaction });
  await recalculatePlayers(links.map((link) => link.playerId), transaction);
};

export const deleteStatsForMatch = async (matchId: number, transaction?: Transaction) => {
  await PlayerMatchStat.destroy({ where: { matchId }, transaction });
};

export const validatePlayersBelongToSeason = async (seasonId: number, playerIds: number[]) => {
  const count = await PlayerSeason.count({ where: { playerId: { [Op.in]: playerIds }, seasonId } });
  return count === [...new Set(playerIds)].length;
};

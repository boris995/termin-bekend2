import { Match, MatchPlayerRating, Player, Season } from '../models';

const round = (value: number) => Number(value.toFixed(2));

interface RatingBucket {
  total: number;
  count: number;
}

const addRating = (bucket: RatingBucket | undefined, rating: number): RatingBucket => ({
  total: (bucket?.total || 0) + rating,
  count: (bucket?.count || 0) + 1
});

export const getVotingAnalyticsForSeason = async (seasonId: number) => {
  const season = await Season.findByPk(seasonId);
  if (!season) return null;

  const [matches, players] = await Promise.all([
    Match.findAll({ where: { seasonId }, include: ['homeTeam', 'awayTeam'], order: [['matchNumber', 'ASC']] }),
    Player.findAll({ where: { seasonId }, include: ['team'], order: [['teamId', 'ASC'], ['shirtNumber', 'ASC']] })
  ]);

  const matchIds = matches.map((match) => match.id);
  const ratings = matchIds.length ? await MatchPlayerRating.findAll({ where: { matchId: matchIds } }) : [];
  const playersById = new Map(players.map((player) => [player.id, player]));
  const matchBuckets = new Map<number, RatingBucket>();
  const playerBuckets = new Map<number, RatingBucket>();
  const matchPlayerBuckets = new Map<string, RatingBucket>();

  for (const rating of ratings) {
    matchBuckets.set(rating.matchId, addRating(matchBuckets.get(rating.matchId), rating.rating));
    playerBuckets.set(rating.playerId, addRating(playerBuckets.get(rating.playerId), rating.rating));
    matchPlayerBuckets.set(`${rating.matchId}:${rating.playerId}`, addRating(matchPlayerBuckets.get(`${rating.matchId}:${rating.playerId}`), rating.rating));
  }

  const matchSummaries = matches.map((match) => {
    const matchBucket = matchBuckets.get(match.id) || { total: 0, count: 0 };
    const playerAverages = players
      .map((player) => {
        const bucket = matchPlayerBuckets.get(`${match.id}:${player.id}`);
        return bucket
          ? {
              playerId: player.id,
              playerName: `${player.firstName} ${player.lastName}`,
              teamId: player.teamId,
              teamShortName: (player.get('team') as { shortName?: string } | undefined)?.shortName || '',
              average: round(bucket.total / bucket.count),
              count: bucket.count
            }
          : null;
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .sort((a, b) => b.average - a.average || b.count - a.count);

    return {
      matchId: match.id,
      matchNumber: match.matchNumber,
      playedAt: match.playedAt,
      homeTeam: match.get('homeTeam'),
      awayTeam: match.get('awayTeam'),
      average: matchBucket.count ? round(matchBucket.total / matchBucket.count) : null,
      count: matchBucket.count,
      topRated: playerAverages[0] || null,
      playerAverages
    };
  });

  const playerTrends = players
    .map((player) => {
      const overall = playerBuckets.get(player.id) || { total: 0, count: 0 };
      const trend = matches
        .map((match) => {
          const bucket = matchPlayerBuckets.get(`${match.id}:${player.id}`);
          return bucket
            ? {
                matchId: match.id,
                matchNumber: match.matchNumber,
                average: round(bucket.total / bucket.count),
                count: bucket.count
              }
            : null;
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item));

      return {
        playerId: player.id,
        playerName: `${player.firstName} ${player.lastName}`,
        teamId: player.teamId,
        teamShortName: (player.get('team') as { shortName?: string } | undefined)?.shortName || '',
        overallAverage: overall.count ? round(overall.total / overall.count) : null,
        totalVotes: overall.count,
        trend
      };
    })
    .filter((player) => player.totalVotes > 0)
    .sort((a, b) => Number(b.overallAverage || 0) - Number(a.overallAverage || 0) || b.totalVotes - a.totalVotes);

  return {
    season,
    totalVotes: ratings.length,
    ratedMatches: matchSummaries.filter((match) => match.count > 0).length,
    ratedPlayers: playerTrends.length,
    matchSummaries,
    playerTrends
  };
};

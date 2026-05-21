import bcrypt from 'bcrypt';
import { sequelize } from '../config/database';
import { createMatch } from '../services/matchService';
import { AppSetting, CmsBlock, MatchPlayerRating, MatchPlayerVote, NextMatch, Player, PlayerSeason, Season, Team, User } from '../models';

const avg = (ratings: { pac: number; sho: number; pas: number; dri: number; def: number; phy: number }) =>
  Math.round((ratings.pac + ratings.sho + ratings.pas + ratings.dri + ratings.def + ratings.phy) / 6);

const imagesFor = (slug: string) => ({
  cardImageUrl: `/player-assets/player-card.svg?player=${slug}`,
  galleryImages: [
    `/player-assets/player-photo.svg?player=${slug}&photo=1`,
    `/player-assets/player-photo.svg?player=${slug}&photo=2`,
    `/player-assets/player-photo.svg?player=${slug}&photo=3`
  ]
});

type SeasonKey = 'season1' | 'season2';
type TeamKey = 'white' | 'black';
type PlayerSeed = {
  firstName: string;
  lastName: string;
  nickname: string | null;
  position: 'golman' | 'igrac' | 'golman-igrac';
  shirtNumber: number;
  team: TeamKey;
  seasons: SeasonKey[];
  pac: number;
  sho: number;
  pas: number;
  dri: number;
  def: number;
  phy: number;
};
type SeasonTeamMap = Record<TeamKey, Team>;
type SeededPlayer = { player: Player; seed: PlayerSeed };

const playerSeeds: PlayerSeed[] = [
  { firstName: 'Boris', lastName: 'Djukuic', nickname: 'Boki', position: 'golman', shirtNumber: 1, team: 'white', seasons: ['season1', 'season2'], pac: 72, sho: 65, pas: 60, dri: 58, def: 84, phy: 82 },
  { firstName: 'Stefan', lastName: 'Jeftic', nickname: null, position: 'igrac', shirtNumber: 5, team: 'white', seasons: ['season1', 'season2'], pac: 80, sho: 78, pas: 76, dri: 82, def: 68, phy: 75 },
  { firstName: 'Zeljko', lastName: 'Maksimovic', nickname: null, position: 'igrac', shirtNumber: 7, team: 'white', seasons: ['season1', 'season2'], pac: 78, sho: 74, pas: 79, dri: 81, def: 70, phy: 76 },
  { firstName: 'Bojan', lastName: 'Andzic', nickname: null, position: 'igrac', shirtNumber: 8, team: 'white', seasons: ['season1', 'season2'], pac: 76, sho: 72, pas: 74, dri: 77, def: 69, phy: 74 },
  { firstName: 'Nedeljko', lastName: 'Babic', nickname: null, position: 'golman-igrac', shirtNumber: 12, team: 'white', seasons: ['season1', 'season2'], pac: 64, sho: 58, pas: 62, dri: 60, def: 82, phy: 84 },
  { firstName: 'Milorad', lastName: 'Tomic', nickname: null, position: 'igrac', shirtNumber: 11, team: 'white', seasons: ['season1', 'season2'], pac: 74, sho: 70, pas: 75, dri: 73, def: 72, phy: 78 },
  { firstName: 'David', lastName: 'Lejic', nickname: 'Daki', position: 'igrac', shirtNumber: 9, team: 'white', seasons: ['season1', 'season2'], pac: 83, sho: 80, pas: 72, dri: 84, def: 60, phy: 77 },
  { firstName: 'Vladimir', lastName: 'Peric', nickname: 'Vlado', position: 'igrac', shirtNumber: 10, team: 'black', seasons: ['season1', 'season2'], pac: 75, sho: 80, pas: 84, dri: 83, def: 61, phy: 70 },
  { firstName: 'Djordje', lastName: 'Koprivica', nickname: null, position: 'igrac', shirtNumber: 6, team: 'black', seasons: ['season1', 'season2'], pac: 79, sho: 75, pas: 78, dri: 76, def: 66, phy: 74 },
  { firstName: 'Obrad', lastName: 'Pejic', nickname: null, position: 'igrac', shirtNumber: 4, team: 'black', seasons: ['season1', 'season2'], pac: 82, sho: 77, pas: 70, dri: 76, def: 58, phy: 73 },
  { firstName: 'Petar', lastName: 'Jovanovic', nickname: null, position: 'igrac', shirtNumber: 3, team: 'black', seasons: ['season1', 'season2'], pac: 73, sho: 66, pas: 74, dri: 70, def: 81, phy: 82 },
  { firstName: 'Bogoljub', lastName: 'Sando', nickname: null, position: 'golman-igrac', shirtNumber: 2, team: 'black', seasons: ['season1', 'season2'], pac: 68, sho: 62, pas: 74, dri: 71, def: 78, phy: 80 },
  { firstName: 'Srboljub', lastName: 'Petrovic', nickname: null, position: 'golman', shirtNumber: 13, team: 'black', seasons: ['season1', 'season2'], pac: 62, sho: 50, pas: 68, dri: 65, def: 84, phy: 82 },
  { firstName: 'Florian', lastName: 'Wirtz', nickname: 'Wirtz', position: 'igrac', shirtNumber: 17, team: 'white', seasons: ['season1'], pac: 86, sho: 82, pas: 88, dri: 89, def: 62, phy: 74 },
  { firstName: 'Bukayo', lastName: 'Saka', nickname: 'Saka', position: 'igrac', shirtNumber: 19, team: 'black', seasons: ['season1'], pac: 88, sho: 83, pas: 84, dri: 90, def: 66, phy: 78 }
];

const ratingsFromSeed = ({ pac, sho, pas, dri, def, phy }: PlayerSeed) => ({ pac, sho, pas, dri, def, phy });

const createSeedPlayer = (seed: PlayerSeed, teams: SeasonTeamMap, primarySeasonId: number) => {
  const slug = `${seed.firstName}-${seed.lastName}`.toLowerCase();
  const ratings = ratingsFromSeed(seed);

  return Player.create({
    firstName: seed.firstName,
    lastName: seed.lastName,
    nickname: seed.nickname,
    position: seed.position,
    shirtNumber: seed.shirtNumber,
    ...imagesFor(slug),
    ...ratings,
    overallRating: avg(ratings),
    teamId: teams[seed.team].id,
    seasonId: primarySeasonId
  });
};

const playersForSeason = (seededPlayers: SeededPlayer[], seasonKey: SeasonKey, team: TeamKey) =>
  seededPlayers
    .filter(({ seed }) => seed.team === team && seed.seasons.includes(seasonKey))
    .map(({ player }) => player);

const linkPlayersToSeason = (seasonId: number, teams: SeasonTeamMap, seededPlayers: SeededPlayer[], seasonKey: SeasonKey) => {
  const homeCounters: Record<TeamKey, number> = { white: 0, black: 0 };

  return PlayerSeason.bulkCreate(
    seededPlayers
      .filter(({ seed }) => seed.seasons.includes(seasonKey))
      .map(({ player, seed }) => {
        const index = homeCounters[seed.team]++;
        return {
          playerId: player.id,
          seasonId,
          teamId: teams[seed.team].id,
          showOnHome: index < 4
        };
      })
  );
};

const main = async () => {
  const force = process.env.SEED_FORCE === 'true';
  await sequelize.sync(force ? { force: true } : { alter: true });
  if (!force && (await Season.count()) > 0) {
    console.log('Seed preskocen: baza vec ima podatke. Za reset koristi SEED_FORCE=true npm run seed.');
    await sequelize.close();
    return;
  }

  await User.create({
    name: 'Admin',
    email: 'admin@football.com',
    password: await bcrypt.hash('admin123', 10),
    role: 'admin'
  });

  const season = await Season.create({ number: 1, name: 'Sezona 1: Bijeli vs Crni', winsToWinSeason: 13 });
  const white = await Team.create({
    name: 'Bijeli',
    shortName: 'BIJ',
    logoUrl: '/player-assets/player-card.svg?team=bijeli',
    representativeName: 'Boris Djukuic',
    primaryColor: '#F8FAFC',
    seasonId: season.id
  });
  const black = await Team.create({
    name: 'Crni',
    shortName: 'CRN',
    logoUrl: '/player-assets/player-card.svg?team=crni',
    representativeName: 'Nedeljko Babic',
    primaryColor: '#020617',
    seasonId: season.id
  });

  const seasonOneTeams = { white, black };
  const seededPlayers = await Promise.all(
    playerSeeds.map(async (seed) => ({ seed, player: await createSeedPlayer(seed, seasonOneTeams, season.id) }))
  );
  const seasonOneWhitePlayers = playersForSeason(seededPlayers, 'season1', 'white');
  const seasonOneBlackPlayers = playersForSeason(seededPlayers, 'season1', 'black');
  await linkPlayersToSeason(season.id, seasonOneTeams, seededPlayers, 'season1');
  const fixtures = [
    { homeScore: 6, awayScore: 3, whiteHome: true, daysAgo: 36 },
    { homeScore: 5, awayScore: 7, whiteHome: false, daysAgo: 34 },
    { homeScore: 4, awayScore: 2, whiteHome: true, daysAgo: 32 },
    { homeScore: 3, awayScore: 5, whiteHome: false, daysAgo: 30 },
    { homeScore: 8, awayScore: 6, whiteHome: true, daysAgo: 28 },
    { homeScore: 7, awayScore: 4, whiteHome: false, daysAgo: 26 },
    { homeScore: 5, awayScore: 4, whiteHome: true, daysAgo: 24 },
    { homeScore: 2, awayScore: 4, whiteHome: false, daysAgo: 22 },
    { homeScore: 9, awayScore: 5, whiteHome: true, daysAgo: 20 },
    { homeScore: 8, awayScore: 6, whiteHome: false, daysAgo: 18 },
    { homeScore: 7, awayScore: 5, whiteHome: true, daysAgo: 16 },
    { homeScore: 6, awayScore: 4, whiteHome: false, daysAgo: 14 },
    { homeScore: 5, awayScore: 3, whiteHome: true, daysAgo: 12 },
    { homeScore: 4, awayScore: 3, whiteHome: false, daysAgo: 10 },
    { homeScore: 6, awayScore: 2, whiteHome: true, daysAgo: 8 },
    { homeScore: 7, awayScore: 4, whiteHome: false, daysAgo: 6 },
    { homeScore: 5, awayScore: 4, whiteHome: true, daysAgo: 4 },
    { homeScore: 6, awayScore: 5, whiteHome: true, daysAgo: 2 }
  ];

  let latestMatchId = 0;
  for (const fixture of fixtures) {
    const home = fixture.whiteHome ? white : black;
    const away = fixture.whiteHome ? black : white;
    const homePlayers = fixture.whiteHome ? seasonOneWhitePlayers : seasonOneBlackPlayers;
    const awayPlayers = fixture.whiteHome ? seasonOneBlackPlayers : seasonOneWhitePlayers;
    const playedAt = new Date(Date.now() - fixture.daysAgo * 24 * 60 * 60 * 1000);

    const match = await createMatch({
      seasonId: season.id,
      homeTeamId: home.id,
      awayTeamId: away.id,
      homeScore: fixture.homeScore,
      awayScore: fixture.awayScore,
      startedAt: new Date(playedAt.getTime() - 75 * 60 * 1000),
      endedAt: playedAt,
      playedAt,
      playerStats: [
        ...homePlayers.slice(0, 5).map((player, index) => ({
          playerId: player.id,
          teamId: home.id,
          goals: index === 0 ? Math.max(0, fixture.homeScore - 2) : index === 1 ? 1 : 0,
          assists: index === 2 ? 2 : index === 3 ? 1 : 0
        })),
        ...awayPlayers.slice(0, 5).map((player, index) => ({
          playerId: player.id,
          teamId: away.id,
          goals: index === 0 ? Math.max(0, fixture.awayScore - 1) : index === 1 ? 1 : 0,
          assists: index === 2 ? 1 : index === 3 ? 1 : 0
        }))
      ]
    });
    latestMatchId = match?.id || latestMatchId;
  }

  await MatchPlayerVote.bulkCreate([
    { matchId: latestMatchId, playerId: seasonOneWhitePlayers[0].id, voterKey: 'seed-voter-0001' },
    { matchId: latestMatchId, playerId: seasonOneWhitePlayers[3].id, voterKey: 'seed-voter-0002' },
    { matchId: latestMatchId, playerId: seasonOneBlackPlayers[1].id, voterKey: 'seed-voter-0003' }
  ]);

  await MatchPlayerRating.bulkCreate([
    { matchId: latestMatchId, playerId: seasonOneWhitePlayers[0].id, voterKey: 'seed-rating-0001', rating: 9 },
    { matchId: latestMatchId, playerId: seasonOneWhitePlayers[3].id, voterKey: 'seed-rating-0002', rating: 8 },
    { matchId: latestMatchId, playerId: seasonOneBlackPlayers[1].id, voterKey: 'seed-rating-0003', rating: 7 },
    { matchId: latestMatchId, playerId: seasonOneBlackPlayers[0].id, voterKey: 'seed-rating-0004', rating: 8 }
  ]);

  const seasonTwoStart = new Date(2026, 4, 21, 17, 0, 0);
  const seasonTwo = await Season.create({
    number: 2,
    name: 'Sezona 2: Crni vs Beli',
    winsToWinSeason: 8,
    startedAt: seasonTwoStart
  });
  const seasonTwoBlack = await Team.create({
    name: 'Crni',
    shortName: 'CRN',
    logoUrl: '/player-assets/player-card.svg?team=crni-s2',
    representativeName: 'Petar Perovic',
    primaryColor: '#020617',
    seasonId: seasonTwo.id
  });
  const seasonTwoWhite = await Team.create({
    name: 'Beli',
    shortName: 'BEL',
    logoUrl: '/player-assets/player-card.svg?team=beli-s2',
    representativeName: 'Slobodan Jovanovic',
    primaryColor: '#F8FAFC',
    seasonId: seasonTwo.id
  });

  await linkPlayersToSeason(seasonTwo.id, { white: seasonTwoWhite, black: seasonTwoBlack }, seededPlayers, 'season2');

  await NextMatch.create({
    seasonId: seasonTwo.id,
    homeTeamId: seasonTwoBlack.id,
    awayTeamId: seasonTwoWhite.id,
    scheduledAt: seasonTwoStart,
    venue: 'City Arena',
    note: 'Prva utakmica Sezone 2. Crni: Pero, Kopra, Obrad, Vladimir, Sando i Srbo. Beli: Sone, Murinjo, Bojan, Micko, Makso i Dejvid.'
  });

  // --- Provjerna sezona: MURINjO vs LALAT (LALAT wins series 13-5) ---
  const provSeason = await Season.create({ number: 5, name: 'Provjerna Sezona: MURINjO vs LALAT', winsToWinSeason: 99, startedAt: new Date() });
  const murinjo = await Team.create({
    name: 'MURINjO',
    shortName: 'MUR',
    logoUrl: '/player-assets/player-card.svg?team=murinjo',
    representativeName: 'Murinjo',
    primaryColor: '#1f2937',
    seasonId: provSeason.id
  });
  const lalat = await Team.create({
    name: 'LALAT',
    shortName: 'LAL',
    logoUrl: '/player-assets/player-card.svg?team=lalat',
    representativeName: 'Lalat',
    primaryColor: '#ef4444',
    seasonId: provSeason.id
  });

  const provPlayersData = [
    // MURINjO roster (8)
    ['Mark', 'Murin', 'Murk', 'igrac', 4, 'mur', 78, 72, 75, 76, 65, 74],
    ['Ivan', 'Murinovic', 'IvM', 'igrac', 5, 'mur', 74, 70, 73, 72, 68, 72],
    ['Goran', 'Murinic', 'Gogo', 'igrac', 6, 'mur', 71, 68, 70, 69, 66, 70],
    ['Stefan', 'M', 'Stef', 'golman', 1, 'mur', 60, 48, 66, 62, 86, 82],
    ['Dario', 'Mur', null, 'igrac', 7, 'mur', 76, 69, 74, 75, 64, 71],
    ['Milos', 'Mik', null, 'igrac', 8, 'mur', 73, 67, 72, 70, 69, 73],
    ['Petar', 'M', null, 'igrac', 9, 'mur', 75, 71, 70, 74, 67, 74],
    ['Nik', 'Mur', null, 'golman-igrac', 2, 'mur', 69, 63, 75, 70, 78, 80],
    // LALAT roster (8)
    ['Luka', 'Lalat', 'Luks', 'igrac', 10, 'lal', 84, 80, 79, 82, 60, 78],
    ['Milan', 'L', 'Mila', 'igrac', 11, 'lal', 82, 78, 76, 80, 62, 77],
    ['Nikola', 'L', null, 'igrac', 12, 'lal', 80, 75, 78, 79, 65, 76],
    ['Marko', 'L', null, 'golman', 1, 'lal', 63, 50, 67, 65, 83, 81],
    ['David', 'L', 'Davo', 'igrac', 13, 'lal', 85, 82, 74, 83, 58, 79],
    ['Aleks', 'L', null, 'igrac', 14, 'lal', 79, 74, 77, 78, 66, 75],
    ['Boris', 'L', null, 'igrac', 15, 'lal', 77, 73, 75, 76, 68, 74],
    ['Nemanja', 'L', null, 'golman-igrac', 2, 'lal', 72, 65, 76, 71, 79, 84]
  ] as const;

  const provCreated = await Promise.all(
    provPlayersData.map(([firstName, lastName, nickname, position, shirtNumber, teamKey, pac, sho, pas, dri, def, phy]) => {
      const ratings = { pac, sho, pas, dri, def, phy } as any;
      const teamId = (teamKey === 'mur' ? murinjo.id : lalat.id) as number;
      return Player.create({
        firstName,
        lastName,
        nickname,
        position,
        shirtNumber,
        ...imagesFor(`prov-${firstName}-${lastName}`.toLowerCase()),
        ...ratings,
        overallRating: avg(ratings),
        teamId,
        seasonId: provSeason.id
      });
    })
  );

  const murPlayers = provCreated.filter((p) => p.teamId === murinjo.id);
  const lalPlayers = provCreated.filter((p) => p.teamId === lalat.id);
  await PlayerSeason.bulkCreate([
    ...murPlayers.map((player) => ({ playerId: player.id, seasonId: provSeason.id, teamId: murinjo.id })),
    ...lalPlayers.map((player) => ({ playerId: player.id, seasonId: provSeason.id, teamId: lalat.id }))
  ]);

  // Create 18 fixtures where LALAT wins 13 and MURINjO wins 5
  const provFixtures: Array<{ winner: 'lal' | 'mur'; daysAgo: number; homeIsLal?: boolean } > = [];
  // build array with 13 'lal' and 5 'mur'
  const winners = [...Array(13).fill('lal'), ...Array(5).fill('mur')];
  for (let i = 0; i < winners.length; i++) {
    provFixtures.push({ winner: winners[i] as 'lal' | 'mur', daysAgo: 4 + i * 2, homeIsLal: i % 2 === 0 });
  }

  for (const fixture of provFixtures) {
    const home = fixture.homeIsLal ? lalat : murinjo;
    const away = fixture.homeIsLal ? murinjo : lalat;
    const winnerIsLal = fixture.winner === 'lal';
    const homeScore = winnerIsLal === fixture.homeIsLal ? 3 : 1;
    const awayScore = winnerIsLal === fixture.homeIsLal ? 1 : 3;
    const playedAt = new Date(Date.now() - fixture.daysAgo * 24 * 60 * 60 * 1000);

    const match = await createMatch({
      seasonId: provSeason.id,
      homeTeamId: home.id,
      awayTeamId: away.id,
      homeScore,
      awayScore,
      startedAt: new Date(playedAt.getTime() - 60 * 60 * 1000),
      endedAt: playedAt,
      playedAt,
      playerStats: [
        { playerId: (home.id === murinjo.id ? murPlayers[0].id : lalPlayers[0].id), teamId: home.id, goals: Math.max(0, homeScore - 1), assists: 1 },
        { playerId: (away.id === murinjo.id ? murPlayers[1].id : lalPlayers[1].id), teamId: away.id, goals: Math.max(0, awayScore - 1), assists: 0 }
      ]
    });

    // Add some votes/ratings for the match
    if (match) {
      await MatchPlayerVote.create({ matchId: match.id, playerId: (winnerIsLal ? lalPlayers[0].id : murPlayers[0].id), voterKey: `prov-vote-${match.id}` });
      await MatchPlayerRating.create({ matchId: match.id, playerId: (winnerIsLal ? lalPlayers[0].id : murPlayers[0].id), voterKey: `prov-rate-${match.id}`, rating: 8 + (match.id % 3) });
    }
  }

  await provSeason.update({ winsToWinSeason: 13, status: 'completed', winnerTeamId: lalat.id, finishedAt: new Date() });

  const createArchiveSeason = async (
    config: {
      number: number;
      name: string;
      winsToWinSeason: number;
      status: 'completed';
      teams: Array<{ key: 'a' | 'b'; name: string; shortName: string; color: string; representativeName: string }>;
      fixtures: Array<{ home: 'a' | 'b'; homeScore: number; awayScore: number; daysAgo: number }>;
    }
  ) => {
    const archiveSeason = await Season.create({ number: config.number, name: config.name, winsToWinSeason: config.winsToWinSeason });
    const [teamA, teamB] = await Promise.all(
      config.teams.map((team) =>
        Team.create({
          name: team.name,
          shortName: team.shortName,
          logoUrl: `/player-assets/player-card.svg?team=${team.shortName.toLowerCase()}`,
          representativeName: team.representativeName,
          primaryColor: team.color,
          seasonId: archiveSeason.id
        })
      )
    );
    const teamByKey = { a: teamA, b: teamB };
    const roster = [
      ['Amar', 'Hodzic', 'Amo', 'igrac', 7, 'a', 81, 78, 76, 82, 58, 74],
      ['Dusan', 'Maric', null, 'golman', 1, 'a', 62, 45, 68, 64, 84, 82],
      ['Ivan', 'Knezevic', null, 'igrac', 10, 'a', 76, 82, 80, 79, 60, 72],
      ['Nikola', 'Vukovic', 'Niko', 'igrac', 4, 'a', 72, 68, 73, 70, 80, 78],
      ['Sergej', 'Popovic', null, 'igrac', 11, 'b', 86, 80, 72, 84, 54, 75],
      ['Vasilije', 'Tomic', 'Vaso', 'golman-igrac', 2, 'b', 70, 63, 77, 73, 78, 85],
      ['Andrej', 'Lazic', null, 'igrac', 8, 'b', 79, 75, 81, 80, 62, 73],
      ['Ognjen', 'Simic', null, 'golman', 12, 'b', 59, 42, 64, 60, 86, 83]
    ] as const;
    const archivePlayers = await Promise.all(
      roster.map(([firstName, lastName, nickname, position, shirtNumber, teamKey, pac, sho, pas, dri, def, phy]) => {
        const ratings = { pac, sho, pas, dri, def, phy };
        const team = teamByKey[teamKey];
        return Player.create({
          firstName,
          lastName,
          nickname,
          position,
          shirtNumber,
          ...imagesFor(`${config.number}-${firstName}-${lastName}`.toLowerCase()),
          ...ratings,
          overallRating: avg(ratings),
          teamId: team.id,
          seasonId: archiveSeason.id
        });
      })
    );
    await PlayerSeason.bulkCreate(
      archivePlayers.map((player) => ({ playerId: player.id, seasonId: archiveSeason.id, teamId: player.teamId }))
    );

    for (const fixture of config.fixtures) {
      const home = teamByKey[fixture.home];
      const away = fixture.home === 'a' ? teamB : teamA;
      const homePlayers = archivePlayers.filter((player) => player.teamId === home.id);
      const awayPlayers = archivePlayers.filter((player) => player.teamId === away.id);
      const playedAt = new Date(Date.now() - fixture.daysAgo * 24 * 60 * 60 * 1000);
      await createMatch({
        seasonId: archiveSeason.id,
        homeTeamId: home.id,
        awayTeamId: away.id,
        homeScore: fixture.homeScore,
        awayScore: fixture.awayScore,
        startedAt: new Date(playedAt.getTime() - 70 * 60 * 1000),
        endedAt: playedAt,
        playedAt,
        playerStats: [
          { playerId: homePlayers[0].id, teamId: home.id, goals: Math.max(0, fixture.homeScore - 1), assists: 1 },
          { playerId: homePlayers[1].id, teamId: home.id, goals: 1, assists: 0 },
          { playerId: homePlayers[2].id, teamId: home.id, goals: 0, assists: 2 },
          { playerId: awayPlayers[0].id, teamId: away.id, goals: Math.max(0, fixture.awayScore - 1), assists: 1 },
          { playerId: awayPlayers[1].id, teamId: away.id, goals: 1, assists: 0 },
          { playerId: awayPlayers[2].id, teamId: away.id, goals: 0, assists: 1 }
        ]
      });
    }

    await archiveSeason.update({ status: config.status, finishedAt: new Date(Date.now() - config.fixtures[0].daysAgo * 24 * 60 * 60 * 1000) });
  };

  await createArchiveSeason({
    number: 3,
    name: 'Zimski Kup 2026',
    winsToWinSeason: 5,
    status: 'completed',
    teams: [
      { key: 'a', name: 'North Squad', shortName: 'NTH', color: '#14B8A6', representativeName: 'Amar Hodzic' },
      { key: 'b', name: 'South Crew', shortName: 'STH', color: '#A855F7', representativeName: 'Sergej Popovic' }
    ],
    fixtures: [
      { home: 'a', homeScore: 5, awayScore: 3, daysAgo: 42 },
      { home: 'b', homeScore: 4, awayScore: 4, daysAgo: 38 },
      { home: 'a', homeScore: 2, awayScore: 6, daysAgo: 34 },
      { home: 'b', homeScore: 3, awayScore: 1, daysAgo: 30 }
    ]
  });

  await createArchiveSeason({
    number: 4,
    name: 'Ljetna Liga 2026',
    winsToWinSeason: 6,
    status: 'completed',
    teams: [
      { key: 'a', name: 'Orange Five', shortName: 'ORG', color: '#F97316', representativeName: 'Ivan Knezevic' },
      { key: 'b', name: 'Green Wall', shortName: 'GRN', color: '#22C55E', representativeName: 'Vasilije Tomic' }
    ],
    fixtures: [
      { home: 'a', homeScore: 7, awayScore: 5, daysAgo: 74 },
      { home: 'b', homeScore: 2, awayScore: 2, daysAgo: 70 },
      { home: 'a', homeScore: 4, awayScore: 6, daysAgo: 66 }
    ]
  });

  await CmsBlock.bulkCreate([
    {
      title: 'Live workflow je spreman',
      body: 'Najavljeni mec automatski prelazi u live kada dodje zakazani termin. Admin nakon kraja bira ucesnike, upisuje rezultat, golove i asistencije.',
      type: 'announcement',
      sortOrder: 1
    },
    {
      title: 'Publika bira igraca utakmice',
      body: 'Nakon objave rezultata posjetioci mogu anonimno glasati za igraca utakmice i ocijeniti svakog ucesnika ocjenom od 1 do 10.',
      type: 'news',
      sortOrder: 2
    },
    {
      title: 'Derbi sa trinaest igraca u rotaciji',
      body: 'Seed sada ima vise igraca, vise statistike i primjer glasanja kako bi javne stranice imale dovoljno sadrzaja odmah nakon pokretanja.',
      type: 'text',
      sortOrder: 3
    }
  ]);

  await AppSetting.upsert({
    key: 'donationPage',
    value: JSON.stringify({
      eyebrow: 'Podrzi ligu',
      title: 'Donacije za Duel Ligu',
      intro: 'Pomozite da svaki termin bude bolje organizovan, da rezultati i statistika ostanu uredni i da igraci imaju uslove kakve zasluzuju.',
      impactTitle: 'Sta gradimo zajedno',
      impactBody: 'Podrska ide u termine, lopte, marker opremu, prvu pomoc, snimanje akcija i odrzavanje sajta. Cilj je jednostavan: bolji fudbal, bolja evidencija i vise sadrzaja za publiku.',
      paymentTitle: 'Podaci za uplatu',
      paymentBody: 'Donaciju mozete poslati direktno na racun lige. Ako zelite da podrzite konkretan termin ili opremu, javite se admin timu pre uplate.',
      bankAccount: 'RS35 0000 0000 0000 0000 00',
      recipientName: 'Duel Liga',
      paymentPurpose: 'Donacija za organizaciju lige',
      ctaLabel: 'Kontaktiraj admina',
      ctaUrl: 'mailto:admin@football.com',
      imageUrl: '',
      isPublished: true
    })
  });

  await AppSetting.upsert({ key: 'showClassicHomeIntroSection', value: 'false' });

  console.log('Seed zavrsen. Login: admin@football.com / admin123');
  await sequelize.close();
};

main()
  .then(() => {
    console.log('Seed completed successfully');
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Seed failed:', error);
    await sequelize.close();
    process.exit(1);
  });

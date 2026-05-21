import bcrypt from 'bcrypt';
import { sequelize } from '../config/database';
import { createMatch } from '../services/matchService';
import { AppSetting, CmsBlock, MatchPlayerRating, MatchPlayerVote, NextMatch, Player, Season, Team, User } from '../models';

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

const playerSeeds = [
  ['Boris', 'Djukusic', 'Boki', 'golman-igrac', 1, 'white', 78, 74, 81, 79, 72, 84],
  ['Obrad', 'Pejic', null, 'igrac', 7, 'white', 82, 77, 70, 76, 58, 73],
  ['Vladimir', 'Peric', 'Vlado', 'igrac', 10, 'white', 75, 80, 84, 83, 61, 70],
  ['Marko', 'Jovanovic', 'Maki', 'igrac', 11, 'white', 88, 79, 76, 87, 52, 74],
  ['Stefan', 'Nikolic', null, 'igrac', 5, 'white', 71, 69, 78, 73, 74, 80],
  ['Luka', 'Stojanovic', 'Luks', 'igrac', 8, 'white', 77, 72, 82, 80, 63, 72],
  ['Milos', 'Radovic', null, 'golman', 13, 'white', 58, 44, 63, 61, 84, 83],
  ['Nedeljko', 'Babic', null, 'golman', 12, 'black', 61, 48, 66, 63, 85, 81],
  ['David', 'Lejic', 'Daki', 'igrac', 9, 'black', 86, 82, 73, 85, 55, 76],
  ['Aleksa', 'Kovacevic', 'Aki', 'igrac', 6, 'black', 79, 70, 80, 78, 68, 77],
  ['Petar', 'Savic', null, 'igrac', 3, 'black', 73, 66, 74, 70, 81, 82],
  ['Filip', 'Matic', 'Fico', 'igrac', 14, 'black', 84, 75, 71, 82, 56, 75],
  ['Nemanja', 'Ilic', null, 'golman-igrac', 2, 'black', 70, 62, 76, 72, 79, 86]
] as const;

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
    representativeName: 'Boris Djukusic',
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

  const players = await Promise.all(
    playerSeeds.map(([firstName, lastName, nickname, position, shirtNumber, team, pac, sho, pas, dri, def, phy]) => {
      const slug = `${firstName}-${lastName}`.toLowerCase();
      const ratings = { pac, sho, pas, dri, def, phy };
      return Player.create({
        firstName,
        lastName,
        nickname,
        position,
        shirtNumber,
        ...imagesFor(slug),
        ...ratings,
        overallRating: avg(ratings),
        teamId: team === 'white' ? white.id : black.id,
        seasonId: season.id
      });
    })
  );

  const whitePlayers = players.filter((player) => player.teamId === white.id);
  const blackPlayers = players.filter((player) => player.teamId === black.id);
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
    const homePlayers = fixture.whiteHome ? whitePlayers : blackPlayers;
    const awayPlayers = fixture.whiteHome ? blackPlayers : whitePlayers;
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
    { matchId: latestMatchId, playerId: whitePlayers[0].id, voterKey: 'seed-voter-0001' },
    { matchId: latestMatchId, playerId: whitePlayers[3].id, voterKey: 'seed-voter-0002' },
    { matchId: latestMatchId, playerId: blackPlayers[1].id, voterKey: 'seed-voter-0003' }
  ]);

  await MatchPlayerRating.bulkCreate([
    { matchId: latestMatchId, playerId: whitePlayers[0].id, voterKey: 'seed-rating-0001', rating: 9 },
    { matchId: latestMatchId, playerId: whitePlayers[3].id, voterKey: 'seed-rating-0002', rating: 8 },
    { matchId: latestMatchId, playerId: blackPlayers[1].id, voterKey: 'seed-rating-0003', rating: 7 },
    { matchId: latestMatchId, playerId: blackPlayers[0].id, voterKey: 'seed-rating-0004', rating: 8 }
  ]);

  const seasonTwoStart = new Date(2026, 4, 21, 17, 0, 0);
  const seasonTwo = await Season.create({
    number: 2,
    name: 'Sezona 2: Crni vs Beli',
    winsToWinSeason: 13,
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

  const seasonTwoPlayers = [
    ['Petar', 'Perovic', 'Pero', 'igrac', 4, seasonTwoBlack.id, 77, 76, 72, 78, 66, 78],
    ['Nikola', 'Koprivica', 'Kopra', 'golman-igrac', 1, seasonTwoBlack.id, 72, 67, 79, 74, 80, 84],
    ['Obrad', 'Pejic', 'Obrad', 'igrac', 7, seasonTwoBlack.id, 82, 77, 70, 76, 58, 73],
    ['Vladimir', 'Peric', 'Vladimir', 'igrac', 10, seasonTwoBlack.id, 75, 80, 84, 83, 61, 70],
    ['Aleksandar', 'Sandic', 'Sando', 'igrac', 8, seasonTwoBlack.id, 80, 74, 78, 81, 64, 76],
    ['Srdjan', 'Srbovic', 'Srbo', 'golman', 12, seasonTwoBlack.id, 60, 45, 65, 62, 86, 83],
    ['Slobodan', 'Jovanovic', 'Sone', 'igrac', 11, seasonTwoWhite.id, 84, 79, 77, 85, 57, 75],
    ['Milan', 'Murinjo', 'Murinjo', 'golman-igrac', 2, seasonTwoWhite.id, 71, 65, 82, 73, 79, 86],
    ['Bojan', 'Radovic', 'Bojan', 'igrac', 6, seasonTwoWhite.id, 78, 76, 80, 79, 68, 77],
    ['Mihailo', 'Mickovic', 'Micko', 'igrac', 5, seasonTwoWhite.id, 74, 70, 76, 72, 81, 80],
    ['Maksim', 'Maksimovic', 'Makso', 'igrac', 9, seasonTwoWhite.id, 86, 82, 73, 84, 55, 77],
    ['David', 'Lejic', 'Dejvid', 'igrac', 14, seasonTwoWhite.id, 86, 82, 73, 85, 55, 76]
  ] as const;

  const seasonTwoCreatedPlayers = await Promise.all(
    seasonTwoPlayers.map(([firstName, lastName, nickname, position, shirtNumber, teamId, pac, sho, pas, dri, def, phy]) => {
      const ratings = { pac, sho, pas, dri, def, phy };
      return Player.create({
        firstName,
        lastName,
        nickname,
        position,
        shirtNumber,
        ...imagesFor(`s2-${nickname}`.toLowerCase()),
        ...ratings,
        overallRating: avg(ratings),
        showOnHome: false,
        teamId,
        seasonId: seasonTwo.id
      });
    })
  );

  await Promise.all(
    seasonTwoCreatedPlayers
      .filter((player) => player.teamId === seasonTwoBlack.id || player.teamId === seasonTwoWhite.id)
      .reduce<Player[]>((selected, player) => {
        const sameTeamCount = selected.filter((item) => item.teamId === player.teamId).length;
        return sameTeamCount < 4 ? [...selected, player] : selected;
      }, [])
      .map((player) => player.update({ showOnHome: true }))
  );

  await NextMatch.create({
    seasonId: seasonTwo.id,
    homeTeamId: seasonTwoBlack.id,
    awayTeamId: seasonTwoWhite.id,
    scheduledAt: seasonTwoStart,
    venue: 'City Arena',
    note: 'Prva utakmica Sezone 2. Crni: Pero, Kopra, Obrad, Vladimir, Sando i Srbo. Beli: Sone, Murinjo, Bojan, Micko, Makso i Dejvid.'
  });

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

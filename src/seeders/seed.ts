import bcrypt from 'bcrypt';
import { sequelize } from '../config/database';
import { runMigrations } from '../services/migrationService';
import { AppSetting, CmsBlock, NextMatch, Player, Season, Team, User } from '../models';
import { PlayerPosition } from '../models/Player';

type TeamKey = 'white' | 'black';

interface FocusPlayerSeed {
  firstName: string;
  lastName: string;
  position: PlayerPosition;
  team: TeamKey;
  shirtNumber: number;
  ratings: {
    pac: number;
    sho: number;
    pas: number;
    dri: number;
    def: number;
    phy: number;
  };
}

const focusPlayers: FocusPlayerSeed[] = [
  { firstName: 'Petar', lastName: 'Jovanovic', position: 'igrac', team: 'black', shirtNumber: 4, ratings: { pac: 78, sho: 76, pas: 73, dri: 79, def: 65, phy: 78 } },
  { firstName: 'Obrad', lastName: 'Pejic', position: 'igrac', team: 'black', shirtNumber: 7, ratings: { pac: 82, sho: 77, pas: 70, dri: 76, def: 58, phy: 73 } },
  { firstName: 'Boris', lastName: 'Djukusic', position: 'igrac', team: 'white', shirtNumber: 10, ratings: { pac: 79, sho: 77, pas: 82, dri: 80, def: 70, phy: 84 } },
  { firstName: 'Bojan', lastName: 'Andzic', position: 'igrac', team: 'white', shirtNumber: 6, ratings: { pac: 78, sho: 76, pas: 80, dri: 79, def: 68, phy: 77 } },
  { firstName: 'Milorad', lastName: 'Tomic', position: 'igrac', team: 'white', shirtNumber: 8, ratings: { pac: 74, sho: 72, pas: 78, dri: 75, def: 76, phy: 82 } },
  { firstName: 'Bogoljub', lastName: 'Sando', position: 'igrac', team: 'black', shirtNumber: 8, ratings: { pac: 80, sho: 74, pas: 78, dri: 81, def: 64, phy: 76 } },
  { firstName: 'Zeljko', lastName: 'Maksimovic', position: 'igrac', team: 'white', shirtNumber: 9, ratings: { pac: 86, sho: 82, pas: 73, dri: 84, def: 55, phy: 77 } },
  { firstName: 'David', lastName: 'Lejic', position: 'igrac', team: 'white', shirtNumber: 14, ratings: { pac: 86, sho: 82, pas: 73, dri: 85, def: 55, phy: 76 } },
  { firstName: 'Nedeljko', lastName: 'Babic', position: 'golman', team: 'white', shirtNumber: 1, ratings: { pac: 61, sho: 48, pas: 66, dri: 63, def: 85, phy: 81 } },
  { firstName: 'Srboljub', lastName: 'Petrovic', position: 'golman', team: 'black', shirtNumber: 1, ratings: { pac: 60, sho: 45, pas: 65, dri: 62, def: 86, phy: 83 } },
  { firstName: 'Djordje', lastName: 'Koprivica', position: 'igrac', team: 'black', shirtNumber: 2, ratings: { pac: 72, sho: 67, pas: 79, dri: 74, def: 80, phy: 84 } },
  { firstName: 'Vladimir', lastName: 'Peric', position: 'igrac', team: 'black', shirtNumber: 10, ratings: { pac: 75, sho: 80, pas: 84, dri: 83, def: 61, phy: 70 } },
  { firstName: 'Stefan', lastName: 'Jeftic', position: 'igrac', team: 'white', shirtNumber: 5, ratings: { pac: 77, sho: 72, pas: 76, dri: 78, def: 74, phy: 80 } }
];

const avg = (ratings: FocusPlayerSeed['ratings']) =>
  Math.round((ratings.pac + ratings.sho + ratings.pas + ratings.dri + ratings.def + ratings.phy) / 6);

const imagesFor = (player: FocusPlayerSeed) => {
  const slug = `${player.firstName}-${player.lastName}`.toLowerCase();
  return {
    cardImageUrl: `/player-assets/player-card.svg?player=${slug}`,
    galleryImages: [
      `/player-assets/player-photo.svg?player=${slug}&photo=1`,
      `/player-assets/player-photo.svg?player=${slug}&photo=2`,
      `/player-assets/player-photo.svg?player=${slug}&photo=3`
    ]
  };
};

const resetDatabase = async () => {
  const queryInterface = sequelize.getQueryInterface();
  const tables = (await queryInterface.showAllTables()) as unknown[];
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const table of tables) {
    const tableName = typeof table === 'string' ? table : (table as { tableName: string }).tableName;
    await queryInterface.dropTable(tableName);
  }
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
};

const createFocusPlayers = async (season: Season, teams: Record<TeamKey, Team>) => {
  await Promise.all(
    focusPlayers.map((player) =>
      Player.create({
        firstName: player.firstName,
        lastName: player.lastName,
        nickname: null,
        position: player.position,
        shirtNumber: player.shirtNumber,
        ...imagesFor(player),
        ...player.ratings,
        overallRating: avg(player.ratings),
        showOnHome: true,
        teamId: teams[player.team].id,
        seasonId: season.id
      })
    )
  );
};

const createCmsDefaults = async () => {
  await CmsBlock.bulkCreate([
    {
      title: 'Fokus roster je spreman',
      body: 'Seed sada koristi samo igrace koji su navedeni kao glavni roster za bijelu i crnu ekipu.',
      type: 'announcement',
      sortOrder: 1
    },
    {
      title: 'Utakmica se moze najaviti',
      body: 'Admin moze pokrenuti najavu, zavrsiti live mec i kasnije urediti rezultat, statistiku i timeline.',
      type: 'news',
      sortOrder: 2
    }
  ]);

  await AppSetting.upsert({ key: 'cardDesign', value: 'gold' });
  await AppSetting.upsert({ key: 'siteDesign', value: 'classic' });
  await AppSetting.upsert({
    key: 'donationPage',
    value: JSON.stringify({
      eyebrow: 'Podrzi ligu',
      title: 'Donacije za Duel Ligu',
      intro: 'Podrska pomaze organizaciju termina, opremu i odrzavanje statistike.',
      impactTitle: 'Za sta se koristi podrska',
      impactBody: 'Donacije se koriste za termine, lopte, marker opremu, osnovnu medicinsku opremu i odrzavanje platforme.',
      paymentTitle: 'Kako mozes donirati',
      paymentBody: 'Uplatu mozes poslati direktno na racun lige ili kontaktirati administratore.',
      bankAccount: 'RS35 0000 0000 0000 0000 00',
      recipientName: 'Duel Liga',
      paymentPurpose: 'Donacija za organizaciju lige',
      ctaLabel: 'Kontakt za donaciju',
      ctaUrl: 'mailto:admin@football.com',
      imageUrl: '',
      isPublished: true
    })
  });
};

const main = async () => {
  const force = process.env.SEED_FORCE === 'true';
  if (force) await resetDatabase();
  await runMigrations();

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

  const season = await Season.create({
    number: 1,
    name: 'Sezona 1: Bijela vs Crna',
    winsToWinSeason: 13,
    status: 'active'
  });

  const white = await Team.create({
    name: 'Bijela ekipa',
    shortName: 'BIJ',
    logoUrl: '/player-assets/player-card.svg?team=bijela',
    representativeName: 'Boris Djukusic',
    primaryColor: '#F8FAFC',
    seasonId: season.id
  });

  const black = await Team.create({
    name: 'Crna ekipa',
    shortName: 'CRN',
    logoUrl: '/player-assets/player-card.svg?team=crna',
    representativeName: 'Petar Jovanovic',
    primaryColor: '#020617',
    seasonId: season.id
  });

  await createFocusPlayers(season, { white, black });

  await NextMatch.create({
    seasonId: season.id,
    homeTeamId: black.id,
    awayTeamId: white.id,
    scheduledAt: new Date(2026, 4, 28, 17, 0, 0),
    venue: 'Duel Arena',
    note: 'Fokus roster: bijela ekipa protiv crne ekipe.'
  });

  await createCmsDefaults();

  console.log(`Seed zavrsen sa ${focusPlayers.length} fokus igraca. Login: admin@football.com / admin123`);
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

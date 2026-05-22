import { DataTypes, QueryInterface, Sequelize } from 'sequelize';
import { Migration } from './types';

const tableExists = async (queryInterface: QueryInterface, tableName: string) => {
  const tables = (await queryInterface.showAllTables()) as unknown[];
  return tables.map((table) => (typeof table === 'string' ? table : (table as { tableName: string }).tableName)).includes(tableName);
};

const describeTable = async (queryInterface: QueryInterface, tableName: string) => {
  if (!(await tableExists(queryInterface, tableName))) return null;
  return queryInterface.describeTable(tableName);
};

const ensureColumn = async (
  queryInterface: QueryInterface,
  tableName: string,
  columnName: string,
  definition: Parameters<QueryInterface['addColumn']>[2]
) => {
  const description = await describeTable(queryInterface, tableName);
  if (!description || description[columnName]) return;
  await queryInterface.addColumn(tableName, columnName, definition);
};

const ensureIndex = async (queryInterface: QueryInterface, tableName: string, fields: string[], name: string, unique = false) => {
  if (!(await tableExists(queryInterface, tableName))) return;
  const indexes = (await queryInterface.showIndex(tableName)) as Array<{ name: string }>;
  if (indexes.some((index) => index.name === name)) return;
  await queryInterface.addIndex(tableName, fields, { name, unique });
};

const dateColumns = {
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
  updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
};

const createIfMissing = async (
  queryInterface: QueryInterface,
  tableName: string,
  columns: Parameters<QueryInterface['createTable']>[1]
) => {
  if (await tableExists(queryInterface, tableName)) return;
  await queryInterface.createTable(tableName, columns);
};

export const migration: Migration = {
  name: '20260521232000-initial-schema',
  up: async (queryInterface) => {
    await createIfMissing(queryInterface, 'users', {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
      role: { type: DataTypes.ENUM('admin', 'user'), allowNull: false, defaultValue: 'user' },
      ...dateColumns
    });

    await createIfMissing(queryInterface, 'seasons', {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      number: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, unique: true },
      name: { type: DataTypes.STRING, allowNull: false },
      winsToWinSeason: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 8 },
      status: { type: DataTypes.ENUM('active', 'completed'), allowNull: false, defaultValue: 'active' },
      winnerTeamId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      startedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      finishedAt: { type: DataTypes.DATE, allowNull: true },
      ...dateColumns
    });

    await createIfMissing(queryInterface, 'teams', {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      shortName: { type: DataTypes.STRING(4), allowNull: false },
      logoUrl: { type: DataTypes.STRING, allowNull: true },
      representativeName: { type: DataTypes.STRING, allowNull: true },
      primaryColor: { type: DataTypes.STRING(7), allowNull: true },
      seasonId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      ...dateColumns
    });

    await createIfMissing(queryInterface, 'players', {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      firstName: { type: DataTypes.STRING, allowNull: false },
      lastName: { type: DataTypes.STRING, allowNull: false },
      nickname: { type: DataTypes.STRING, allowNull: true },
      position: { type: DataTypes.ENUM('golman', 'igrac', 'golman-igrac'), allowNull: false },
      shirtNumber: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      cardImageUrl: { type: DataTypes.STRING, allowNull: true },
      cardImageX: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
      cardImageY: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
      cardImageScale: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 1 },
      galleryImages: { type: DataTypes.JSON, allowNull: true },
      pac: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 50 },
      sho: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 50 },
      pas: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 50 },
      dri: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 50 },
      def: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 50 },
      phy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 50 },
      overallRating: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 50 },
      goals: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      assists: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      showOnHome: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      teamId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      seasonId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      ...dateColumns
    });

    await createIfMissing(queryInterface, 'matches', {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      seasonId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      homeTeamId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      awayTeamId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      homeScore: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      awayScore: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      winnerTeamId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      matchNumber: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      playedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      startedAt: { type: DataTypes.DATE, allowNull: true },
      endedAt: { type: DataTypes.DATE, allowNull: true },
      votingEnabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      reportSummary: { type: DataTypes.TEXT, allowNull: true },
      timelineEvents: { type: DataTypes.JSON, allowNull: true },
      status: { type: DataTypes.ENUM('played', 'cancelled'), allowNull: false, defaultValue: 'played' },
      ...dateColumns
    });

    await createIfMissing(queryInterface, 'player_match_stats', {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      matchId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      playerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      teamId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      goals: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      assists: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      ...dateColumns
    });

    await createIfMissing(queryInterface, 'match_player_ratings', {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      matchId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      playerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      voterKey: { type: DataTypes.STRING(80), allowNull: false },
      rating: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      ...dateColumns
    });

    await createIfMissing(queryInterface, 'match_player_votes', {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      matchId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      playerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      voterKey: { type: DataTypes.STRING(80), allowNull: false },
      ...dateColumns
    });

    await createIfMissing(queryInterface, 'cms_blocks', {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING, allowNull: false },
      body: { type: DataTypes.TEXT, allowNull: false },
      type: { type: DataTypes.ENUM('text', 'news', 'announcement'), allowNull: false, defaultValue: 'text' },
      imageUrl: { type: DataTypes.STRING, allowNull: true },
      sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      isPublished: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      ...dateColumns
    });

    await createIfMissing(queryInterface, 'next_matches', {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      seasonId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      homeTeamId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      awayTeamId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      scheduledAt: { type: DataTypes.DATE, allowNull: false },
      venue: { type: DataTypes.STRING, allowNull: true },
      note: { type: DataTypes.TEXT, allowNull: true },
      status: { type: DataTypes.ENUM('scheduled', 'live', 'completed', 'cancelled'), allowNull: false, defaultValue: 'scheduled' },
      startedAt: { type: DataTypes.DATE, allowNull: true },
      endedAt: { type: DataTypes.DATE, allowNull: true },
      matchId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      ...dateColumns
    });

    await createIfMissing(queryInterface, 'app_settings', {
      key: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
      value: { type: DataTypes.TEXT, allowNull: false },
      ...dateColumns
    });

    await ensureColumn(queryInterface, 'matches', 'reportSummary', { type: DataTypes.TEXT, allowNull: true });
    await ensureColumn(queryInterface, 'matches', 'timelineEvents', { type: DataTypes.JSON, allowNull: true });
    await ensureColumn(queryInterface, 'players', 'cardImageX', { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 });
    await ensureColumn(queryInterface, 'players', 'cardImageY', { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 });
    await ensureColumn(queryInterface, 'players', 'cardImageScale', { type: DataTypes.FLOAT, allowNull: false, defaultValue: 1 });
    await ensureColumn(queryInterface, 'players', 'galleryImages', { type: DataTypes.JSON, allowNull: true });
    await ensureColumn(queryInterface, 'players', 'showOnHome', { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false });
    await ensureColumn(queryInterface, 'next_matches', 'startedAt', { type: DataTypes.DATE, allowNull: true });
    await ensureColumn(queryInterface, 'next_matches', 'endedAt', { type: DataTypes.DATE, allowNull: true });
    await ensureColumn(queryInterface, 'next_matches', 'matchId', { type: DataTypes.INTEGER.UNSIGNED, allowNull: true });

    await ensureIndex(queryInterface, 'teams', ['name', 'seasonId'], 'teams_name_season_id_unique', true);
    await ensureIndex(queryInterface, 'matches', ['seasonId', 'matchNumber'], 'matches_season_id_match_number_unique', true);
    await ensureIndex(queryInterface, 'match_player_ratings', ['matchId', 'playerId', 'voterKey'], 'match_player_ratings_match_player_voter_unique', true);
    await ensureIndex(queryInterface, 'match_player_votes', ['matchId', 'voterKey'], 'match_player_votes_match_voter_unique', true);
  }
};

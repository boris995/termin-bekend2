import { QueryTypes, Sequelize } from 'sequelize';
import { sequelize } from '../config/database';
import { migrations } from '../migrations';

const migrationsTable = 'schema_migrations';

const ensureMigrationsTable = async () => {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS ${migrationsTable} (
      name VARCHAR(190) NOT NULL PRIMARY KEY,
      executedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

const getExecutedMigrations = async () => {
  await ensureMigrationsTable();
  const rows = await sequelize.query<{ name: string }>(`SELECT name FROM ${migrationsTable}`, { type: QueryTypes.SELECT });
  return new Set(rows.map((row) => row.name));
};

export const runMigrations = async () => {
  const executed = await getExecutedMigrations();
  const queryInterface = sequelize.getQueryInterface();

  for (const migration of migrations) {
    if (executed.has(migration.name)) continue;
    console.log(`Pokrecem migraciju: ${migration.name}`);
    await migration.up(queryInterface, Sequelize);
    await sequelize.query(`INSERT INTO ${migrationsTable} (name) VALUES (?)`, { replacements: [migration.name] });
    console.log(`Migracija zavrsena: ${migration.name}`);
  }
};

export const getMigrationStatus = async () => {
  const executed = await getExecutedMigrations();
  return migrations.map((migration) => ({
    name: migration.name,
    executed: executed.has(migration.name)
  }));
};

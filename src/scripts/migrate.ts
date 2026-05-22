import dotenv from 'dotenv';
import { sequelize } from '../config/database';
import '../models';
import { runMigrations } from '../services/migrationService';

dotenv.config();

const main = async () => {
  await sequelize.authenticate();
  await runMigrations();
  await sequelize.close();
};

main().catch(async (error) => {
  console.error('Migracije nisu uspjele:', error);
  await sequelize.close();
  process.exit(1);
});

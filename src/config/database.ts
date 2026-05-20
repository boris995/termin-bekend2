import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const sslEnabled = process.env.DB_SSL === 'true';
const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false';

const getSslCa = () => {
  if (process.env.DB_SSL_CA_BASE64) {
    return Buffer.from(process.env.DB_SSL_CA_BASE64, 'base64').toString('utf8');
  }

  if (process.env.DB_SSL_CA) {
    return process.env.DB_SSL_CA.replace(/\\n/g, '\n');
  }

  return undefined;
};

const getDialectOptions = () => {
  if (!sslEnabled) return undefined;

  const ca = getSslCa();

  return {
    ssl: {
      rejectUnauthorized,
      ...(ca ? { ca } : {})
    }
  };
};

const createSequelize = () => {
  if (process.env.DATABASE_URL) {
    const databaseUrl = new URL(process.env.DATABASE_URL);
    const databaseName = databaseUrl.pathname.replace(/^\//, '');

    return new Sequelize(databaseName, decodeURIComponent(databaseUrl.username), decodeURIComponent(databaseUrl.password), {
      host: databaseUrl.hostname,
      port: Number(databaseUrl.port || 3306),
      dialect: 'mysql',
      logging: false,
      dialectOptions: getDialectOptions()
    });
  }

  return new Sequelize(
    process.env.DB_NAME || 'football_face_off',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      dialect: 'mysql',
      logging: false,
      dialectOptions: getDialectOptions()
    }
  );
};

export const sequelize = createSequelize();

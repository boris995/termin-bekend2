import dotenv from 'dotenv';
import { app } from './app';
import { sequelize } from './config/database';
import { activateDueNextMatches } from './services/matchService';

dotenv.config();

const port = Number(process.env.PORT || 5000);

const start = async () => {
  await sequelize.authenticate();
  await sequelize.sync();
  app.listen(port, () => {
    console.log(`Football Face-Off API radi na http://localhost:${port}`);
  });
  await activateDueNextMatches();
  setInterval(() => {
    activateDueNextMatches().catch((error) => console.error('Automatsko pokretanje najavljenih meceva nije uspjelo:', error));
  }, 60 * 1000);
};

start().catch((error) => {
  console.error('Backend nije pokrenut:', error);
  process.exit(1);
});

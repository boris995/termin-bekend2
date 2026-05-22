import { QueryInterface, Sequelize } from 'sequelize';

export interface Migration {
  name: string;
  up: (queryInterface: QueryInterface, SequelizeStatic: typeof Sequelize) => Promise<void>;
  down?: (queryInterface: QueryInterface, SequelizeStatic: typeof Sequelize) => Promise<void>;
}

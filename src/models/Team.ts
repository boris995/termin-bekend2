import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface TeamAttributes {
  id: number;
  name: string;
  shortName: string;
  logoUrl?: string | null;
  representativeName?: string | null;
  primaryColor?: string | null;
  seasonId: number;
}

type TeamCreationAttributes = Optional<TeamAttributes, 'id' | 'logoUrl' | 'representativeName' | 'primaryColor'>;

export class Team extends Model<TeamAttributes, TeamCreationAttributes> implements TeamAttributes {
  declare id: number;
  declare name: string;
  declare shortName: string;
  declare logoUrl: string | null;
  declare representativeName: string | null;
  declare primaryColor: string | null;
  declare seasonId: number;
}

Team.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    shortName: { type: DataTypes.STRING(4), allowNull: false },
    logoUrl: { type: DataTypes.STRING, allowNull: true },
    representativeName: { type: DataTypes.STRING, allowNull: true },
    primaryColor: { type: DataTypes.STRING(7), allowNull: true },
    seasonId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }
  },
  {
    sequelize,
    tableName: 'teams',
    indexes: [{ unique: true, fields: ['name', 'seasonId'] }]
  }
);

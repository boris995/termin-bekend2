import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type PlayerPosition = 'golman' | 'igrac' | 'golman-igrac';

interface PlayerAttributes {
  id: number;
  firstName: string;
  lastName: string;
  nickname?: string | null;
  position: PlayerPosition;
  shirtNumber: number;
  cardImageUrl?: string | null;
  galleryImages: string[];
  pac: number;
  sho: number;
  pas: number;
  dri: number;
  def: number;
  phy: number;
  overallRating: number;
  goals: number;
  assists: number;
  showOnHome: boolean;
  teamId: number;
  seasonId: number;
}

type PlayerCreationAttributes = Optional<
  PlayerAttributes,
  'id' | 'nickname' | 'cardImageUrl' | 'galleryImages' | 'pac' | 'sho' | 'pas' | 'dri' | 'def' | 'phy' | 'overallRating' | 'goals' | 'assists' | 'showOnHome'
>;

export class Player extends Model<PlayerAttributes, PlayerCreationAttributes> implements PlayerAttributes {
  declare id: number;
  declare firstName: string;
  declare lastName: string;
  declare nickname: string | null;
  declare position: PlayerPosition;
  declare shirtNumber: number;
  declare cardImageUrl: string | null;
  declare galleryImages: string[];
  declare pac: number;
  declare sho: number;
  declare pas: number;
  declare dri: number;
  declare def: number;
  declare phy: number;
  declare overallRating: number;
  declare goals: number;
  declare assists: number;
  declare showOnHome: boolean;
  declare teamId: number;
  declare seasonId: number;
}

Player.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    nickname: { type: DataTypes.STRING, allowNull: true },
    position: { type: DataTypes.ENUM('golman', 'igrac', 'golman-igrac'), allowNull: false },
    shirtNumber: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    cardImageUrl: { type: DataTypes.STRING, allowNull: true },
    galleryImages: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    pac: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 50, validate: { min: 0, max: 99 } },
    sho: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 50, validate: { min: 0, max: 99 } },
    pas: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 50, validate: { min: 0, max: 99 } },
    dri: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 50, validate: { min: 0, max: 99 } },
    def: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 50, validate: { min: 0, max: 99 } },
    phy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 50, validate: { min: 0, max: 99 } },
    overallRating: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 50, validate: { min: 0, max: 99 } },
    goals: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
    assists: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
    showOnHome: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    teamId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    seasonId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }
  },
  { sequelize, tableName: 'players' }
);

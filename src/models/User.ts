import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type UserRole = 'admin' | 'user';

interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

type UserCreationAttributes = Optional<UserAttributes, 'id' | 'role'>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: number;
  declare name: string;
  declare email: string;
  declare password: string;
  declare role: UserRole;
}

User.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('admin', 'user'), allowNull: false, defaultValue: 'user' }
  },
  { sequelize, tableName: 'users' }
);

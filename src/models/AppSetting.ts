import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

interface AppSettingAttributes {
  key: string;
  value: string;
}

export class AppSetting extends Model<AppSettingAttributes> implements AppSettingAttributes {
  declare key: string;
  declare value: string;
}

AppSetting.init(
  {
    key: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
    value: { type: DataTypes.TEXT, allowNull: false }
  },
  { sequelize, tableName: 'app_settings' }
);

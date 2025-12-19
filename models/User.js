// Modèle User avec Sequelize ORM
import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  email: {
    type: DataTypes.TEXT,
    allowNull: true,
    unique: true
  },
  role: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: false,
  freezeTableName: true
});

export default User;


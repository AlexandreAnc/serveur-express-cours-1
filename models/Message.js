// Modèle Message avec Sequelize ORM
import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  pseudo: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'messages',
  timestamps: false,
  freezeTableName: true
});

export default Message;


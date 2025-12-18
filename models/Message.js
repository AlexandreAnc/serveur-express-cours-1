// Modèle Message avec Sequelize (pour validation ORM)
var { DataTypes } = require('sequelize');
var sequelize = require('../config/sequelize');

var Message = sequelize.define('Message', {
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

module.exports = Message;


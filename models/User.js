// Modèle User avec Sequelize (pour validation ORM)
var { DataTypes } = require('sequelize');
var sequelize = require('../config/sequelize');

var User = sequelize.define('User', {
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

module.exports = User;


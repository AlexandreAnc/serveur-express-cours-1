var Sequelize = require('sequelize');
var sequelize = require('./index');

// Définir le modèle User correspondant à la table existante
var User = sequelize.define('User', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  email: {
    type: Sequelize.TEXT,
    allowNull: true,
    unique: true
  },
  role: {
    type: Sequelize.TEXT,
    allowNull: true
  }
}, {
  tableName: 'users', // Nom de la table dans la base de données
  timestamps: false, // La table n'a pas de colonnes createdAt/updatedAt
  freezeTableName: true // Empêche Sequelize de modifier le nom de la table
});

module.exports = User;


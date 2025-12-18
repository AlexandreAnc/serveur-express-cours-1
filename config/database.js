var Sequelize = require('sequelize');
var path = require('path');

// Chemin vers le fichier de base de données SQLite
// Note: .db3 et .sqlite sont des formats identiques (SQLite)
var dbPath = path.join(__dirname, '../mds_b3dev_api_dev.db3');

// Configuration de la connexion Sequelize avec SQLite
var sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath, // Fichier SQLite existant
  logging: false, // Mettre à true pour voir les requêtes SQL dans la console
  define: {
    timestamps: false, // Les tables existantes n'ont pas de timestamps
    underscored: false, // Utilise camelCase pour les noms de colonnes
    freezeTableName: true // Empêche Sequelize de pluraliser les noms de tables
  }
});

module.exports = sequelize;


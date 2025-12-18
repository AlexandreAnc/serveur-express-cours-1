var Database = require('better-sqlite3');
var path = require('path');

// Chemin vers le fichier de base de données SQLite
// Note: .db3 et .sqlite sont des formats identiques (SQLite)
var dbPath = path.join(__dirname, '../mds_b3dev_api_dev.db3');

// Créer la connexion à la base de données
var db = new Database(dbPath);

// Activer le mode WAL (Write-Ahead Logging) pour de meilleures performances
db.pragma('journal_mode = WAL');

// Activer les clés étrangères
db.pragma('foreign_keys = ON');

console.log('✓ Base de données SQLite connectée:', dbPath);

module.exports = db;

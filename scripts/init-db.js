#!/usr/bin/env node

/**
 * Script pour initialiser la base de données SQLite
 * Crée les tables si elles n'existent pas
 */

var sequelize = require('../models/index');
var User = require('../models/User');

// Synchroniser tous les modèles avec la base de données
sequelize.sync({ force: false })
  .then(function() {
    console.log('✓ Base de données initialisée avec succès');
    console.log('✓ Tables créées/synchronisées');
    process.exit(0);
  })
  .catch(function(err) {
    console.error('✗ Erreur lors de l\'initialisation:', err);
    process.exit(1);
  });


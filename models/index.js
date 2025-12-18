var sequelize = require('../config/database');

// Tester la connexion à la base de données
sequelize.authenticate()
  .then(function() {
    console.log('✓ Connexion à la base de données SQLite réussie');
  })
  .catch(function(err) {
    console.error('✗ Erreur de connexion à la base de données:', err);
  });

// Exporter sequelize pour pouvoir créer des modèles
module.exports = sequelize;


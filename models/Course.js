var Sequelize = require('sequelize');
var sequelize = require('./index');
var User = require('./User');

// Définir le modèle Course correspondant à la table existante
var Course = sequelize.define('Course', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  price: {
    type: Sequelize.REAL,
    allowNull: true
  },
  instructor_id: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'courses', // Nom de la table dans la base de données
  timestamps: false, // La table n'a pas de colonnes createdAt/updatedAt
  freezeTableName: true // Empêche Sequelize de modifier le nom de la table
});

// Définir la relation : un cours appartient à un instructeur (User)
Course.belongsTo(User, {
  foreignKey: 'instructor_id',
  as: 'instructor'
});

// Relation inverse : un utilisateur peut avoir plusieurs cours
User.hasMany(Course, {
  foreignKey: 'instructor_id',
  as: 'courses'
});

module.exports = Course;


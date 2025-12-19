// Modèle Course avec Sequelize ORM
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const User = require('./User');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.REAL,
    allowNull: true
  },
  instructor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'courses',
  timestamps: false,
  freezeTableName: true
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


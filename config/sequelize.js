// Configuration Sequelize ORM
const { Sequelize } = require('sequelize');
const path = require('path');

const dbPath = path.join(__dirname, '../mds_b3dev_api_dev.db3');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false,
  define: {
    timestamps: false,
    freezeTableName: true
  }
});

module.exports = sequelize;


// Configuration Sequelize pour validation ORM
var { Sequelize } = require('sequelize');
var path = require('path');

var dbPath = path.join(__dirname, '../mds_b3dev_api_dev.db3');

var sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false,
  define: {
    timestamps: false,
    freezeTableName: true
  }
});

module.exports = sequelize;


// Configuration Sequelize ORM
import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export default sequelize;


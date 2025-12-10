const { Sequelize } = require('sequelize');
const config = require('../config/database');
const Message = require('./message');
const Menu = require('./menu');
const Order = require('./order');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

let sequelize;
try {
  sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: false, // Disable logging
  });
} catch (error) {
  console.warn('Database initialization skipped:', error.message);
  // Create a dummy sequelize instance for serverless environments
  sequelize = null;
}

const db = {
  sequelize,
  Sequelize,
  Message: sequelize ? Message(sequelize, Sequelize.DataTypes) : null,
  Menu: sequelize ? Menu(sequelize, Sequelize.DataTypes) : null,
  Order: sequelize ? Order(sequelize, Sequelize.DataTypes) : null,
};

module.exports = db;
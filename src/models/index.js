const { Sequelize } = require('sequelize');
const config = require('../config/database');
const Message = require('./message');
const Menu = require('./menu');
const Order = require('./order');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: dbConfig.dialect,
});

const db = {
  sequelize,
  Sequelize,
  Message: Message(sequelize, Sequelize.DataTypes),
  Menu: Menu(sequelize, Sequelize.DataTypes),
  Order: Order(sequelize, Sequelize.DataTypes),
};

module.exports = db;
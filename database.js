const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('chitchat', 'root', 'asd123', {
  host: 'localhost',
  dialect: 'mysql',
});

module.exports = sequelize;
const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    validate: {
      notNull: true,
      notEmpty: true,
    },
  },
  sender: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: true,
      notEmpty: true,
    },
  },
  recipient: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: true,
      notEmpty: true,
    },
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: true,
      notEmpty: true,
    },
  },
}, {
  timestamps: true,
});

module.exports = Message;

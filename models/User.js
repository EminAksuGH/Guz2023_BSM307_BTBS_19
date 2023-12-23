const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const USER_REGEX = /^[a-zA-Z][a-zA-Z0-9]{2,16}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{3,32}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


const User = sequelize.define('User', {
  
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    validate: {
      notNull: true,
    },
  },

  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notNull: true,
      notEmpty: true,
    },
    customValidator(value) {
      if (!USER_REGEX.test(value)) {
        throw new Error('Username must meet the specified criteria.');
      }
    },
  },

  mail: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      notNull: true,
      notEmpty: true,
      isEmail: true,
    },
    customValidator(value) {
      if (!EMAIL_REGEX.test(value)) {
        throw new Error('Mail must meet the specified criteria.');
      }
    },
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: true,
      notEmpty: true,
    },
    customValidator(value) {
      if (!PWD_REGEX.test(value)) {
        throw new Error('Password must meet the specified criteria.');
      }
    },
  },

  photo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: true,
  }
},
{
  timestamps: false,
});

module.exports = User;
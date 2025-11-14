const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Mobile_Number: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  OTP_Timestamp: {
    type: DataTypes.DATE,
    allowNull: true
  },
  OTP: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  Is_Verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  Created_At: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  Updated_At: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Users',
  timestamps: true,
  createdAt: 'Created_At',
  updatedAt: 'Updated_At'
});

module.exports = User;


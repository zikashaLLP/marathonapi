const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Marathon = require('./Marathon');

const Result = sequelize.define('Result', {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Marathon_Id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Marathon',
      key: 'Id'
    }
  },
  BIB_Number: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  Name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  Gender: {
    type: DataTypes.ENUM('Male', 'Female'),
    allowNull: true
  },
  Race_Time: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  Category: {
    type: DataTypes.ENUM('Open', 'Defence'),
    allowNull: true
  },
  Position: {
    type: DataTypes.ENUM('First', 'Second', 'Third'),
    allowNull: true
  },
  Image: {
    type: DataTypes.STRING(255),
    allowNull: true
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
  tableName: 'Result',
  timestamps: true,
  createdAt: 'Created_At',
  updatedAt: 'Updated_At'
});

// Define associations
Result.belongsTo(Marathon, { foreignKey: 'Marathon_Id', as: 'Marathon' });
Marathon.hasMany(Result, { foreignKey: 'Marathon_Id', as: 'Results' });

module.exports = Result;


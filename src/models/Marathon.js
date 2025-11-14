const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Marathon = sequelize.define('Marathon', {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  Track_Length: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  Date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  Reporting_Time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  Run_Start_Time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  Location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  Terms_Conditions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  How_To_Apply: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Eligibility_Criteria: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Rules_Regulations: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Runner_Amenities: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Route_Map: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  Price_List: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Fees_Amount: {
    type: DataTypes.DECIMAL(10, 2),
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
  tableName: 'Marathon',
  timestamps: true,
  createdAt: 'Created_At',
  updatedAt: 'Updated_At'
});

module.exports = Marathon;


const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ParticipantDetails = sequelize.define('ParticipantDetails', {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Full_Name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  Email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  Contact_Number: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
  Gender: {
    type: DataTypes.ENUM('Male', 'Female', 'Other'),
    allowNull: false
  },
  Age: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  Address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  City: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  Pincode: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  State: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  Tshirt_Size: {
    type: DataTypes.ENUM('XS', 'S', 'M', 'L', 'XL', 'XXL'),
    allowNull: false
  },
  Date_of_Birth: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  Blood_Group: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  Running_Group: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  Is_Terms_Condition_Accepted: {
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
  tableName: 'ParticipantDetails',
  timestamps: true,
  createdAt: 'Created_At',
  updatedAt: 'Updated_At'
});

module.exports = ParticipantDetails;


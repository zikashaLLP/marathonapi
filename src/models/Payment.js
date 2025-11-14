const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Participant = require('./Participant');
const User = require('./User');

const Payment = sequelize.define('Payment', {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Transaction_Id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  Order_Id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true
  },
  Participant_Id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Participant',
      key: 'Id'
    }
  },
  User_Id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'Id'
    }
  },
  Amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  Payment_Status: {
    type: DataTypes.ENUM('Pending', 'Success', 'Failed'),
    defaultValue: 'Pending'
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
  tableName: 'Payment',
  timestamps: true,
  createdAt: 'Created_At',
  updatedAt: 'Updated_At'
});

// Define associations
Payment.belongsTo(Participant, { foreignKey: 'Participant_Id', as: 'Participant' });
Payment.belongsTo(User, { foreignKey: 'User_Id', as: 'User' });

Participant.hasMany(Payment, { foreignKey: 'Participant_Id', as: 'Payments' });
User.hasMany(Payment, { foreignKey: 'User_Id', as: 'Payments' });

module.exports = Payment;


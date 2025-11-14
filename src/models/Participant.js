const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const ParticipantDetails = require('./ParticipantDetails');
const Marathon = require('./Marathon');

const Participant = sequelize.define('Participant', {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  BIB_Number: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: true
  },
  User_Id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'Id'
    }
  },
  ParticipantDetails_Id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'ParticipantDetails',
      key: 'Id'
    }
  },
  Marathon_Id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Marathon',
      key: 'Id'
    }
  },
  Marathon_Type: {
    type: DataTypes.ENUM('Open', 'Defence'),
    allowNull: true
  },
  Is_Payment_Completed: {
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
  tableName: 'Participant',
  timestamps: true,
  createdAt: 'Created_At',
  updatedAt: 'Updated_At'
});

// Define associations
Participant.belongsTo(User, { foreignKey: 'User_Id', as: 'User' });
Participant.belongsTo(ParticipantDetails, { foreignKey: 'ParticipantDetails_Id', as: 'ParticipantDetails' });
Participant.belongsTo(Marathon, { foreignKey: 'Marathon_Id', as: 'Marathon' });

User.hasMany(Participant, { foreignKey: 'User_Id', as: 'Participants' });
ParticipantDetails.hasMany(Participant, { foreignKey: 'ParticipantDetails_Id', as: 'Participants' });
Marathon.hasMany(Participant, { foreignKey: 'Marathon_Id', as: 'Participants' });

module.exports = Participant;


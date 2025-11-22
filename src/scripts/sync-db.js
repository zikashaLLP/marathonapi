require('dotenv').config();
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

// Import all models to ensure they are registered
const Marathon = require('../models/Marathon');
const ParticipantDetails = require('../models/ParticipantDetails');
const Participant = require('../models/Participant');
const Payment = require('../models/Payment');
const Result = require('../models/Result');

const forceSync = async () => {
  try {
    logger.info('🔄 Starting database force sync...');
    
    // Test connection first
    await sequelize.authenticate();
    logger.info('✅ Database connection established');
    
    // Force sync - this will drop existing tables and recreate them
    // WARNING: This will delete all data!
    await sequelize.sync({ force: true });
    
    logger.info('✅ Database tables synchronized successfully');
    logger.info('📊 Tables created:');
    logger.info('   - Marathon');
    logger.info('   - ParticipantDetails');
    logger.info('   - Participant');
    logger.info('   - Payment');
    logger.info('   - Result');
    
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error synchronizing database:', error);
    process.exit(1);
  }
};

// Run the sync
forceSync();


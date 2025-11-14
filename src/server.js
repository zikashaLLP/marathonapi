require('dotenv').config();
const app = require('./app');
const { sequelize, testConnection } = require('./config/database');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

// Test database connection
testConnection();

// Sync database models (set to false in production, use migrations instead)
if (process.env.NODE_ENV === 'development') {
  sequelize.sync({ alter: false })
    .then(() => {
      logger.info('✅ Database models synchronized');
    })
    .catch((error) => {
      logger.error('❌ Error synchronizing database models:', error);
    });
}

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server is running on port ${PORT}`);
  logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  await sequelize.close();
  process.exit(0);
});


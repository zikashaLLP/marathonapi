const crypto = require('crypto');
const logger = require('../utils/logger');
const { HTTP_STATUS } = require('../utils/constants');
require('dotenv').config();

// Webhook authentication middleware using SHA256 hash validation
// PhonePe sends: Authorization: SHA256(username:password)
const webhookAuth = (req, res, next) => {
  try {
    const username = process.env.PHONEPE_CALLBACK_USERNAME;
    const password = process.env.PHONEPE_CALLBACK_PASSWORD;

    // Check if credentials are configured
    if (!username || !password) {
      logger.error('PhonePe webhook credentials not configured');
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Webhook authentication not configured'
      });
    }

    // Get Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      logger.warn('Missing Authorization header in webhook request');
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: 'error',
        message: 'Unauthorized'
      });
    }

    // PhonePe sends Authorization header as: SHA256(username:password)
    // The header value is the SHA256 hash of "username:password"
    // It may be sent as just the hash, or with "SHA256" prefix
    // Extract the hash value (remove "SHA256" prefix if present)
    let receivedHash = authHeader.trim();
    if (receivedHash.toLowerCase().startsWith('sha256 ')) {
      receivedHash = receivedHash.substring(7).trim();
    } else if (receivedHash.toLowerCase().startsWith('sha256:')) {
      receivedHash = receivedHash.substring(7).trim();
    }

    // Calculate expected hash: SHA256(username:password)
    const credentialsString = `${username}:${password}`;
    const expectedHash = crypto
      .createHash('sha256')
      .update(credentialsString)
      .digest('hex');

    // Compare hashes (case-insensitive comparison)
    if (receivedHash.toLowerCase() !== expectedHash.toLowerCase()) {
      logger.warn('Invalid webhook authorization hash received');
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: 'error',
        message: 'Unauthorized'
      });
    }

    logger.info('✅ Webhook authentication successful');
    next();
  } catch (error) {
    logger.error('Error in webhook authentication:', error);
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      status: 'error',
      message: 'Authentication failed'
    });
  }
};

module.exports = { webhookAuth };

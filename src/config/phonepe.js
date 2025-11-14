require('dotenv').config();
const { StandardCheckoutClient, Env } = require('pg-sdk-node');

// PhonePe SDK Configuration
const PHONEPE_CONFIG = {
  clientId: process.env.PHONEPE_CLIENT_ID,
  clientSecret: process.env.PHONEPE_CLIENT_SECRET,
  clientVersion: parseInt(process.env.PHONEPE_CLIENT_VERSION || '1'),
  environment: process.env.PHONEPE_ENVIRONMENT === 'production' ? Env.PRODUCTION : Env.SANDBOX,
  // Callback validation credentials (optional but recommended for security)
  // These are configured in your PhonePe dashboard for callback authentication
  callbackUsername: process.env.PHONEPE_CALLBACK_USERNAME,
  callbackPassword: process.env.PHONEPE_CALLBACK_PASSWORD
};

// Initialize PhonePe SDK Client
let phonepeClient = null;

const getPhonePeClient = () => {
  if (!phonepeClient) {
    if (!PHONEPE_CONFIG.clientId || !PHONEPE_CONFIG.clientSecret) {
      throw new Error('PhonePe credentials (CLIENT_ID and CLIENT_SECRET) not configured');
    }
    
    phonepeClient = StandardCheckoutClient.getInstance(
      PHONEPE_CONFIG.clientId,
      PHONEPE_CONFIG.clientSecret,
      PHONEPE_CONFIG.clientVersion,
      PHONEPE_CONFIG.environment
    );
  }
  
  return phonepeClient;
};

module.exports = {
  PHONEPE_CONFIG,
  getPhonePeClient
};

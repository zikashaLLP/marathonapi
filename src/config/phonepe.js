require('dotenv').config();
const crypto = require('crypto');

const PHONEPE_CONFIG = {
  merchantId: process.env.PHONEPE_MERCHANT_ID,
  saltKey: process.env.PHONEPE_SALT_KEY,
  saltIndex: process.env.PHONEPE_SALT_INDEX || 1,
  environment: process.env.PHONEPE_ENVIRONMENT || 'sandbox',
  baseUrl: process.env.PHONEPE_ENVIRONMENT === 'production' 
    ? 'https://api.phonepe.com/apis/hermes'
    : 'https://api-preprod.phonepe.com/apis/pg-simulator'
};

// Generate X-VERIFY header for PhonePe
const generateXVerify = (payload) => {
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const stringToHash = base64Payload + PHONEPE_CONFIG.baseUrl + PHONEPE_CONFIG.saltKey;
  const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
  return sha256Hash + '###' + PHONEPE_CONFIG.saltIndex;
};

// Verify callback signature
const verifyCallback = (xVerify, payload) => {
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const stringToHash = base64Payload + PHONEPE_CONFIG.saltKey;
  const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
  const expectedXVerify = sha256Hash + '###' + PHONEPE_CONFIG.saltIndex;
  return xVerify === expectedXVerify;
};

module.exports = {
  PHONEPE_CONFIG,
  generateXVerify,
  verifyCallback
};


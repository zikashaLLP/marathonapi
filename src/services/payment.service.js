const axios = require('axios');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Participant = require('../models/Participant');
const { PHONEPE_CONFIG, generateXVerify, verifyCallback } = require('../config/phonepe');
const { HTTP_STATUS } = require('../utils/constants');
const logger = require('../utils/logger');
require('dotenv').config();

// Create payment order
const createPaymentOrder = async (participantId, userId, amount) => {
  try {
    const participant = await Participant.findByPk(participantId, {
      include: [{ model: require('../models/Marathon'), as: 'Marathon' }]
    });
    
    if (!participant) {
      throw new Error('Participant not found');
    }
    
    if (participant.User_Id !== userId) {
      throw new Error('Unauthorized access to participant');
    }
    
    if (participant.Is_Payment_Completed) {
      throw new Error('Payment already completed');
    }
    
    // Generate order ID
    const orderId = `ORDER_${Date.now()}_${participantId}`;
    
    // Create payment record
    const payment = await Payment.create({
      Order_Id: orderId,
      Participant_Id: participantId,
      User_Id: userId,
      Amount: amount,
      Payment_Status: 'Pending'
    });
    
    // Prepare PhonePe payment request
    const merchantTransactionId = orderId;
    const callbackUrl = `${process.env.BASE_URL}/api/payment/callback`;
    
    const payload = {
      merchantId: PHONEPE_CONFIG.merchantId,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: userId.toString(),
      amount: amount * 100, // Amount in paise
      redirectUrl: callbackUrl,
      redirectMode: 'REDIRECT',
      callbackUrl: callbackUrl,
      mobileNumber: participant.ParticipantDetails?.Contact_Number || '',
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    };
    
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const xVerify = generateXVerify(payload);
    
    // Make payment request to PhonePe
    const response = await axios.post(
      `${PHONEPE_CONFIG.baseUrl}/pg/v1/pay`,
      { request: base64Payload },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
          'Accept': 'application/json'
        }
      }
    );
    
    if (response.data.success) {
      return {
        success: true,
        paymentUrl: response.data.data.instrumentResponse.redirectInfo.url,
        orderId: orderId,
        paymentId: payment.Id
      };
    } else {
      throw new Error('Failed to create payment order');
    }
  } catch (error) {
    logger.error('Error in createPaymentOrder:', error);
    throw error;
  }
};

// Verify payment callback
const verifyPaymentCallback = async (transactionId, orderId, xVerify) => {
  try {
    const payment = await Payment.findOne({
      where: { Order_Id: orderId },
      include: [{ model: Participant, as: 'Participant' }]
    });
    
    if (!payment) {
      throw new Error('Payment not found');
    }
    
    // Verify callback signature
    const payload = {
      merchantId: PHONEPE_CONFIG.merchantId,
      merchantTransactionId: orderId,
      transactionId: transactionId
    };
    
    if (!verifyCallback(xVerify, payload)) {
      throw new Error('Invalid callback signature');
    }
    
    // Check payment status with PhonePe
    const statusUrl = `${PHONEPE_CONFIG.baseUrl}/pg/v1/status/${PHONEPE_CONFIG.merchantId}/${orderId}`;
    const xVerifyStatus = generateXVerify({ merchantId: PHONEPE_CONFIG.merchantId, merchantTransactionId: orderId });
    
    const statusResponse = await axios.get(statusUrl, {
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerifyStatus,
        'X-MERCHANT-ID': PHONEPE_CONFIG.merchantId,
        'Accept': 'application/json'
      }
    });
    
    const paymentStatus = statusResponse.data.data.state === 'COMPLETED' ? 'Success' : 'Failed';
    
    // Update payment record
    payment.Transaction_Id = transactionId;
    payment.Payment_Status = paymentStatus;
    await payment.save();
    
    // Update participant payment status
    if (paymentStatus === 'Success' && payment.Participant) {
      payment.Participant.Is_Payment_Completed = true;
      await payment.Participant.save();
    }
    
    return {
      success: paymentStatus === 'Success',
      paymentStatus,
      payment
    };
  } catch (error) {
    logger.error('Error in verifyPaymentCallback:', error);
    throw error;
  }
};

// Get payment status
const getPaymentStatus = async (orderId, userId) => {
  try {
    const payment = await Payment.findOne({
      where: { Order_Id: orderId, User_Id: userId },
      include: [
        { model: Participant, as: 'Participant' },
        { model: require('../models/Marathon'), as: 'Marathon', through: { model: Participant } }
      ]
    });
    
    if (!payment) {
      throw new Error('Payment not found');
    }
    
    return payment;
  } catch (error) {
    logger.error('Error in getPaymentStatus:', error);
    throw error;
  }
};

module.exports = {
  createPaymentOrder,
  verifyPaymentCallback,
  getPaymentStatus
};


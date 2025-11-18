const Payment = require('../models/Payment');
const Participant = require('../models/Participant');
const { getPhonePeClient, PHONEPE_CONFIG } = require('../config/phonepe');
const { StandardCheckoutPayRequest } = require('pg-sdk-node');
const logger = require('../utils/logger');
require('dotenv').config();

// Create payment order using PhonePe SDK
const createPaymentOrder = async (participantId, userId, amount) => {
  try {
    const participant = await Participant.findByPk(participantId, {
      include: [
        { model: require('../models/Marathon'), as: 'Marathon' },
        { model: require('../models/ParticipantDetails'), as: 'ParticipantDetails' }
      ]
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
    const merchantOrderId = `ORDER_${Date.now()}_${participantId}`;
    
    // Create payment record
    const payment = await Payment.create({
      Order_Id: merchantOrderId,
      Participant_Id: participantId,
      User_Id: userId,
      Amount: amount,
      Payment_Status: 'Pending'
    });
    
    // Prepare redirect URL - this is where PhonePe redirects the user after payment
    // This backend endpoint will verify payment, update database, and redirect to frontend
    const redirectUrl = `${process.env.FRONTEND_URL }?merchantOrderId=${merchantOrderId}`;
    
    // Build payment request using PhonePe SDK
    const paymentRequest = StandardCheckoutPayRequest.builder()
      .merchantOrderId(merchantOrderId)
      .amount(Math.round(amount * 100)) // Amount in paise
      .redirectUrl(redirectUrl)
      .build();
    
    // Get PhonePe client and initiate payment
    const client = getPhonePeClient();
    const response = await client.pay(paymentRequest);
    
    if (response && response.redirectUrl) {
      logger.info('PhonePe payment initiated successfully:', {
        merchantOrderId,
        amount: paymentRequest.amount,
        paymentId: payment.Id
      });
      
      return {
        success: true,
        paymentUrl: response.redirectUrl,
        orderId: merchantOrderId,
        paymentId: payment.Id
      };
    }
    
    throw new Error('Failed to get payment URL from PhonePe');
  } catch (error) {
    logger.error('Error in createPaymentOrder:', {
      message: error.message,
      stack: error.stack
    });
    
    throw error;
  }
};

// Verify payment (called from redirect URL)
const verifyPayment = async (merchantOrderId) => {
  try {
    // Find payment record
    const payment = await Payment.findOne({
      where: { Order_Id: merchantOrderId },
      include: [{ model: Participant, as: 'Participant' }]
    });
    
    if (!payment) {
      throw new Error('Payment not found');
    }
    
    // Get latest status from PhonePe
    const client = getPhonePeClient();
    const statusResponse = await client.getOrderStatus(merchantOrderId);
    
    // Extract status from PhonePe response
    const state = statusResponse.state;
    const paymentStatus = state === 'COMPLETED' ? 'Success' : 
                         state === 'FAILED' ? 'Failed' : 'Pending';
    
    // Update payment record
    payment.Payment_Status = paymentStatus;
    payment.Updated_At = new Date();
    if (statusResponse.paymentDetails.length > 0) {
      payment.Transaction_Id = statusResponse.paymentDetails[0].transactionId;
    }
    await payment.save();
    
    // Update participant payment status if successful
    if (paymentStatus === 'Success' && payment.Participant) {
      payment.Participant.Is_Payment_Completed = true;
      await payment.Participant.save();
    }
    
    return {
      success: paymentStatus === 'Success',
      paymentStatus,
      state: state,
      payment,
      orderId: merchantOrderId,
      transactionId: payment.Transaction_Id
    };
  } catch (error) {
    logger.error('Error in verifyPayment:', {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment
};

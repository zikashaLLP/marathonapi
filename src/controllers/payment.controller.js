const { HTTP_STATUS } = require('../utils/constants');
const paymentService = require('../services/payment.service');
const logger = require('../utils/logger');

// Create payment order for one or multiple participants
// Request body: { participantIds: [1, 2, ...], totalAmount: 500.00 }
// For single participant, pass array with one element: { participantIds: [1], totalAmount: 200.00 }
const createPayment = async (req, res, next) => {
  try {
    const { participantIds, totalAmount } = req.body;
    
    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'participantIds array is required and must not be empty'
      });
    }
    
    if (!totalAmount || totalAmount <= 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Total amount is required and must be greater than 0'
      });
    }
    
    const result = await paymentService.createPaymentOrder(
      participantIds.map(id => parseInt(id)),
      parseFloat(totalAmount)
    );
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Payment order created successfully',
      data: result
    });
  } catch (error) {
    logger.error('Error in createPayment controller:', error);
    next(error);
  }
};

// Verify payment (used as redirect URL from PhonePe)
const verifyPayment = async (req, res, next) => {
  try {
    const { merchantOrderId } = req.query;
    
    if (!merchantOrderId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'MerchantOrderId is required'
      });
    }
    
    // Verify payment status from PhonePe and update database
    const result = await paymentService.verifyPayment(merchantOrderId);
    
    const status = result.state;
    const paymentStatus = result.paymentStatus;
    
    // Return JSON response
    return res.status(HTTP_STATUS.OK).json({
      success: paymentStatus === 'Success',
      message: paymentStatus === 'Success' 
        ? `Payment successful for ${result.participantCount} participant(s)` 
        : 'Payment failed',
      data: {
        merchantOrderId: result.orderId,
        paymentStatus: paymentStatus,
        state: status,
        transactionId: result.transactionId,
        payments: result.payments,
        participantCount: result.participantCount
      }
    });
  } catch (error) {
    logger.error('Error in verifyPayment controller:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};

module.exports = {
  createPayment,
  verifyPayment
};


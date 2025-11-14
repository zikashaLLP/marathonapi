const { HTTP_STATUS } = require('../utils/constants');
const paymentService = require('../services/payment.service');
const logger = require('../utils/logger');

const createPayment = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { participantId, amount } = req.body;
    
    const result = await paymentService.createPaymentOrder(
      parseInt(participantId),
      userId,
      parseFloat(amount)
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

const paymentCallback = async (req, res, next) => {
  try {
    // PhonePe sends callback as POST with base64 encoded response
    const { response } = req.body;
    const xVerify = req.headers['x-verify'];
    
    if (!response || !xVerify) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Invalid callback data'
      });
    }
    
    // Decode the response
    const decodedResponse = Buffer.from(response, 'base64').toString('utf-8');
    const callbackData = JSON.parse(decodedResponse);
    
    const { transactionId, merchantTransactionId } = callbackData.data;
    const orderId = merchantTransactionId;
    
    const result = await paymentService.verifyPaymentCallback(
      transactionId,
      orderId,
      xVerify
    );
    
    if (result.success) {
      // Redirect to success page
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?orderId=${orderId}`);
    } else {
      // Redirect to failure page
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failed?orderId=${orderId}`);
    }
  } catch (error) {
    logger.error('Error in paymentCallback controller:', error);
    // Even on error, redirect to failure page
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failed`);
  }
};

const getPaymentStatus = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { orderId } = req.params;
    
    const payment = await paymentService.getPaymentStatus(orderId, userId);
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: payment
    });
  } catch (error) {
    logger.error('Error in getPaymentStatus controller:', error);
    next(error);
  }
};

module.exports = {
  createPayment,
  paymentCallback,
  getPaymentStatus
};


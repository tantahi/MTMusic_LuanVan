const { Op, literal, col, sequelize } = require('sequelize');
const Stripe = require('stripe');
const stripeConfig = require('../config/stripeconfig');
const User = require("../app/models/User");
const Payment = require('../app/models/Payment');
const PaymentReceipt = require('../app/models/PaymentReceipt');
const Media = require('../app/models/Media');
const Playlist = require('../app/models/Playlist');
const moment = require('moment');

const createStripe = () => {
  return new Stripe(stripeConfig.secretKey, {
    apiVersion: stripeConfig.apiVersion,
  });
};

const stripeModule = {
  createPaymentIntent: async (amount) => {
    const stripe = createStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
    });
    return paymentIntent;
  },

  createPayment: async (amount, paymentMethodId, userId) => {
    const stripe = createStripe();

    const paymentIntent = await stripeModule.createPaymentIntent(amount);

    const confirmedPayment = await stripe.paymentIntents.confirm(paymentIntent.id, {
      payment_method: paymentMethodId,
    });

    return {
      status: 'succeeded',
      id: confirmedPayment.id,
      amount: confirmedPayment.amount,
      created: confirmedPayment.created,
    };
  },

  updateUserVipDates: async (userId) => {
    const user = await User.findByPk(userId);

    if (user) {
      const currentDate = moment();
      const vipEndDate = moment().add(1, 'year');

      user.vip_start_date = currentDate;
      user.vip_end_date = vipEndDate;
      if(user.role !== 'Admin' && user.role !== 'Staff') {
        user.role = "Vip User";
      }

      await user.save();

      console.log(`Updated VIP dates for user: ${userId}`);
    } else {
      console.log(`User with id ${userId} not found`);
    }
  },

  purchaseItem: async (itemType, itemId, userId, paymentMethodId) => {
    let item, amount, price, tax, total;

    try {
      // Find the item based on its type
      if (itemType === 'Song' || itemType === 'Podcast') {
        item = await Media.findByPk(itemId);
      } else if (itemType === 'Album') {
        item = await Playlist.findByPk(itemId);
      } else if (itemType === 'VIP Subscription') {
        item = { name: 'VIP Subscription', price: 9.99, createdBy: null };
      } else {
        throw new Error('Invalid item type');
      }

      if (!item) {
        throw new Error('Item not found');
      }

      price = parseFloat(item.price);
      tax = price * 0.1;
      total = price - tax; 
      amount = Math.round(price);

      const paymentResult = await stripeModule.createPayment(amount, paymentMethodId, userId);

      if (paymentResult.status === 'succeeded') {
        let payment;
        let status = itemType === 'VIP Subscription' ? 'Completed' : 'Pending';

        if (itemType === 'VIP Subscription') {
          // Only update VIP status for VIP Subscription purchases
          await stripeModule.updateUserVipDates(userId);
        } else {
          payment = await Payment.findOne({
            where: { 
              requesterId: item.createdBy, 
              status: 'Pending'
            }
          });

          if (!payment) {
            payment = await Payment.create({
              requesterId: item.createdBy,
              approverId: null,
              totalAmount: total,
              status: 'Pending',
              requestNote: `Purchase of ${itemType}: ${item.name}`,
            //   requestedAt: new Date()
            });
          } else {
            const updatedTotalAmount = parseFloat(payment.totalAmount) + total;
            const updatedRequestNote = payment.requestNote 
              ? `${payment.requestNote}, Purchase of ${itemType}: ${item.name}`
              : `Purchase of ${itemType}: ${item.name}`;

            await payment.update({
              totalAmount: updatedTotalAmount,
              requestNote: updatedRequestNote
            });
          }
        }

        const sellerId = itemType === 'VIP Subscription' ? null : (item.createdBy || item.user_id);
        if (!sellerId && itemType !== 'VIP Subscription') {
          throw new Error('Seller ID not found for non-VIP item');
        }

        const receipt = await PaymentReceipt.create({
          payment_id: payment ? payment.id : null,
          user_id: userId,
          seller_id: sellerId,
          item_id: itemType === 'VIP Subscription' ? null : itemId,
          item_type: itemType,
          price: price,
          tax: tax,
          total: total,
        });

        return {
          success: true,
          status: 200,
          message: `Successfully ${status === 'Completed' ? 'purchased' : 'added to pending payment'} ${itemType.toLowerCase()}${item.name ? ': ' + item.name : ''}`,
          data: {
            paymentId: payment ? payment.id : null,
            receiptId: receipt.id,
            amount: price,
            tax: tax,
            total: total,
            sellerId: sellerId
          }
        };
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      console.error('Error in purchaseItem:', error);
      return {
        success: false,
        status: 500,
        message: 'An error occurred while processing the purchase',
        error: error.toString()
      };
    }
  }
};

module.exports = stripeModule;
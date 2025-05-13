const User = require('../models/User');
const Media = require('../models/Media');
const Playlist = require('../models/Playlist');
const Payment = require('../models/Payment');
const PaymentReceipt = require('../models/PaymentReceipt');
const stripeModule = require('../../utils/stripe');
const { Op, literal, col, sequelize } = require('sequelize');

class PaymentController {

// [GET] /payments
static async getAllPayments(req, res) {
    try {
      const payments = await Payment.findAll({
        include: [
          {
            model: User,
            as: 'requester',
            attributes: ['id', 'full_name'],
          },
          {
            model: User,
            as: 'approver',
            attributes: ['id', 'full_name'],
          },
          {
            model: PaymentReceipt,
            as: 'receipts',
            attributes: [],
          }
        ],
        attributes: [
          'id',
          'totalAmount',
          'status',
          'requestNote',
          'approvalNote',
          'requestedAt',
          'approvedAt',
          'completedAt',
          [literal('(SELECT COUNT(*) FROM payment_receipts WHERE payment_receipts.payment_id = "Payment"."id")'), 'totalReceipts'],
          [literal('(SELECT COALESCE(SUM(total), 0) FROM payment_receipts WHERE payment_receipts.payment_id = "Payment"."id")'), 'totalReceiptsValue'],
          [literal('(SELECT COALESCE(SUM(tax), 0) FROM payment_receipts WHERE payment_receipts.payment_id = "Payment"."id")'), 'totalTax']
        ],
        group: ['Payment.id', 'requester.id', 'approver.id'],
        having: literal('(SELECT COUNT(*) FROM payment_receipts WHERE payment_receipts.payment_id = "Payment"."id") > 0'),
        order: [['created_at', 'DESC']]
      });
  
      const formattedPayments = payments.map(payment => {
        const plainPayment = payment.get({ plain: true });
        return {
          ...plainPayment,
          totalReceipts: parseInt(plainPayment.totalReceipts),
          totalReceiptsValue: parseFloat(plainPayment.totalReceiptsValue),
          totalTax: parseFloat(plainPayment.totalTax),
          requester: plainPayment.requester,
          approver: plainPayment.approver
        };
      });
  
      return res.status(200).json({
        success: true,
        status: 200,
        message: "Successfully retrieved all payments.",
        data: formattedPayments
      });
    } catch (error) {
      console.error('Error in getAllPayments:', error);
      return res.status(500).json({
        success: false,
        status: 500,
        message: "An error occurred while retrieving payments.",
        error: error.message
      });
    }
  }

  // [GET] /payments/processed
  static async getProcessedPayments(req, res) {
    try {
      const processedPayments = await Payment.findAll({
        where: {
          status: {
            [Op.in]: ['Approved', 'Rejected', 'Completed']
          }
        },
        include: [
          {
            model: User,
            as: 'requester',
            attributes: ['id', 'full_name'],
          },
          {
            model: User,
            as: 'approver',
            attributes: ['id', 'full_name'],
          },
          {
            model: PaymentReceipt,
            as: 'receipts',
            include: [
              {
                model: User,
                as: 'Buyer',
                attributes: ['id', 'full_name'],
              },
              {
                model: User,
                as: 'Seller',
                attributes: ['id', 'full_name'],
              },
              {
                model: Media,
                as: 'MediaItem',
                attributes: ['id', 'name'],
                required: false
              },
              {
                model: Playlist,
                as: 'PlaylistItem',
                attributes: ['id', 'name'],
                required: false
              }
            ],
            attributes: [
              'id', 'tax', 'price', 'total', 'user_id', 'item_type', 'item_id', 'seller_id',
              [
                literal(`CASE 
                  WHEN "receipts"."item_type" = 'Song' OR "receipts"."item_type" = 'Podcast' THEN "receipts->MediaItem"."name"
                  WHEN "receipts"."item_type" = 'Album' THEN "receipts->PlaylistItem"."name"
                  ELSE NULL
                END`),
                'item_name'
              ]
            ]
          }
        ],
        attributes: [
          'id', 'totalAmount', 'status', 'requestNote', 'approvalNote', 'requestedAt', 'approvedAt', 'completedAt'
        ],
        order: [['created_at', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        status: 200,
        message: "Successfully retrieved processed payments.",
        data: processedPayments
      });
    } catch (error) {
      console.error('Error in getProcessedPayments:', error);
      return res.status(500).json({
        success: false,
        status: 500,
        message: "An error occurred while retrieving the processed payments list.",
        error: error.message
      });
    }
  }


// [GET] /payments/user/:userId
static async getUserPayments(req, res) {
    const { userId } = req.params;
  
    try {
      const userPayments = await Payment.findAll({
        where: { 
          requesterId: userId,
          '$receipts.item_type$': { [Op.ne]: 'VIP Subscription' }
        },
        include: [
          {
            model: User,
            as: 'requester',
            attributes: ['id', 'full_name'],
          },
          {
            model: User,
            as: 'approver',
            attributes: ['id', 'full_name'],
          },
          {
            model: PaymentReceipt,
            as: 'receipts',
            include: [
              {
                model: User,
                as: 'Buyer',
                attributes: ['id', 'full_name'],
              },
              {
                model: User,
                as: 'Seller',
                attributes: ['id', 'full_name'],
              },
              {
                model: Media,
                as: 'MediaItem',
                attributes: ['id', 'name', 'media_type'],
                required: false,
              },
              {
                model: Playlist,
                as: 'PlaylistItem',
                attributes: ['id', 'name', 'type'],
                required: false,
              },
            ],
            attributes: [
              'id', 'tax', 'price', 'total', 'item_type', 'item_id', 'created_at', 'updated_at',
              [
                literal(`CASE 
                  WHEN "receipts"."item_type" = 'Song' OR "receipts"."item_type" = 'Podcast' THEN "receipts->MediaItem"."name"
                  WHEN "receipts"."item_type" = 'Album' THEN "receipts->PlaylistItem"."name"
                  ELSE NULL
                END`),
                'item_name'
              ]
            ],
          },
        ],
        attributes: [
          'id', 'totalAmount', 'status', 'requestNote', 'approvalNote', 'requestedAt', 'approvedAt', 'completedAt'
        ],
        order: [['created_at', 'DESC']]
      });
  
      return res.status(200).json({
        success: true,
        status: 200,
        message: "Successfully retrieved user's payments.",
        data: userPayments
      });
  
    } catch (error) {
      console.error('Error in getUserPayments:', error);
      return res.status(500).json({
        success: false,
        status: 500,
        message: "An error occurred while fetching the user's payments.",
        error: error.message
      });
    }
  }

  // [GET] /payments/user/:userId/latest
  static async getUserLatestPayments(req, res) {
    const { userId } = req.params;

    try {
      const userLatestPayments = await Payment.findAll({
        where: { 
          requesterId: userId,
          id: {
            [Op.notIn]: literal(`(
              SELECT DISTINCT payment_id 
              FROM payment_receipts 
              WHERE item_type = 'VIP Subscription'
            )`)
          }
        },
        include: [
          {
            model: User,
            as: 'requester',
            attributes: ['id', 'full_name'],
          },
          {
            model: PaymentReceipt,
            as: 'receipts',
            attributes: [],
          }
        ],
        attributes: [
          'id',
          [col('requester.full_name'), 'ownerName'],
          'totalAmount',
          [literal('(SELECT COUNT(*) FROM payment_receipts WHERE payment_receipts.payment_id = "Payment".id)'), 'totalReceipts'],
          [literal('(SELECT COALESCE(SUM(total), 0) FROM payment_receipts WHERE payment_receipts.payment_id = "Payment".id)'), 'totalReceiptsValue'],
          'requestedAt',
          'status'
        ],
        order: [['requestedAt', 'DESC']], // Sort by the newest first
      });

      return res.status(200).json({
        success: true,
        status: 200,
        message: "Successfully retrieved user's payments (excluding VIP Subscriptions) sorted by newest.",
        data: userLatestPayments
      });

    } catch (error) {
      console.error('Error in getUserLatestPayments:', error);
      return res.status(500).json({
        success: false,
        status: 500,
        message: "An error occurred while fetching the user's latest payments.",
        error: error.message
      });
    }
  }

        // [GET] /payments/latest
  static async getLatestPayments(req, res) {
    try {
      const latestPayments = await Payment.findAll({
        include: [
          {
            model: User,
            as: 'requester',
            attributes: ['id', 'full_name'],
          },
          {
            model: User,
            as: 'approver',
            attributes: ['id', 'full_name'],
          },
          {
            model: PaymentReceipt,
            as: 'receipts',
            include: [
              {
                model: User,
                as: 'Buyer',
                attributes: ['id', 'full_name'],
              },
              {
                model: User,
                as: 'Seller',
                attributes: ['id', 'full_name'],
              },
              {
                model: Media,
                as: 'MediaItem',
                attributes: ['id', 'name'],
                required: false
              },
              {
                model: Playlist,
                as: 'PlaylistItem',
                attributes: ['id', 'name'],
                required: false
              }
            ],
            attributes: [
              'id', 'tax', 'price', 'total', 'user_id', 'item_type', 'item_id', 'seller_id',
              [
                literal(`CASE 
                  WHEN "receipts"."item_type" = 'Song' OR "receipts"."item_type" = 'Podcast' THEN "receipts->MediaItem"."name"
                  WHEN "receipts"."item_type" = 'Album' THEN "receipts->PlaylistItem"."name"
                  ELSE NULL
                END`),
                'item_name'
              ]
            ]
          }
        ],
        attributes: [
          'id', 'totalAmount', 'status', 'requestNote', 'approvalNote', 'requestedAt', 'approvedAt', 'completedAt'
        ],
        order: [['requestedAt', 'DESC']] // Sort by the newest first
      });

      return res.status(200).json({
        success: true,
        status: 200,
        message: "Successfully retrieved all payments sorted by newest.",
        data: latestPayments
      });
    } catch (error) {
      console.error('Error in getLatestPayments:', error);
      return res.status(500).json({
        success: false,
        status: 500,
        message: "An error occurred while retrieving the latest payments list.",
        error: error.message
      });
    }
  }

  // [GET] /payments/requested
  static async getRequestedPayments(req, res) {
    try {
      const pendingPayments = await Payment.findAll({
        where: {
          status: 'Requested'
        },
        include: [
          {
            model: User,
            as: 'requester',
            attributes: ['id', 'full_name'],
          },
          {
            model: PaymentReceipt,
            as: 'receipts',
            attributes: [],
          }
        ],
        attributes: [
          'id',
          'totalAmount',
          'status',
          'requestNote',
          'requestedAt',
          [literal('(SELECT COUNT(*) FROM payment_receipts WHERE payment_receipts.payment_id = "Payment"."id")'), 'totalReceipts'],
          [literal('(SELECT COALESCE(SUM(price), 0) FROM payment_receipts WHERE payment_receipts.payment_id = "Payment"."id")'), 'totalReceiptsValue']
        ],
        group: ['Payment.id', 'requester.id'],
        having: literal('(SELECT COUNT(*) FROM payment_receipts WHERE payment_receipts.payment_id = "Payment"."id") > 0')
      });

      const formattedPendingPayments = pendingPayments.map(payment => {
        const plainPayment = payment.get({ plain: true });
        return {
          ...plainPayment,
          totalReceipts: parseInt(plainPayment.totalReceipts),
          totalReceiptsValue: parseFloat(plainPayment.totalReceiptsValue),
          requester: plainPayment.requester
        };
      });

      return res.status(200).json({
        success: true,
        status: 200,
        message: "Successfully retrieved pending payments.",
        data: formattedPendingPayments
      });
    } catch (error) {
      console.error('Error in getPendingPayments:', error);
      return res.status(500).json({
        success: false,
        status: 500,
        message: "An error occurred while retrieving pending payments.",
        error: error.message
      });
    }
  }

// [GET] /payments/:id//
static async getPaymentDetails(req, res) {
    try {
      const { id } = req.params;
      const paymentId = parseInt(id, 10);
  
      if (isNaN(paymentId)) {
        return res.status(400).json({
          success: false,
          status: 400,
          message: "Invalid payment ID.",
        });
      }
  
      // Fetch the payment
      const payment = await Payment.findByPk(paymentId, {
        attributes: [
          'id', 'totalAmount', 'status', 'requestNote', 'approvalNote', 
          'requestedAt', 'approvedAt', 'completedAt', 'requesterId', 'approverId'
        ]
      });
  
      if (!payment) {
        return res.status(404).json({
          success: false,
          status: 404,
          message: "Payment not found.",
        });
      }
  
      // Fetch the requester and approver
      const [requester, approver] = await Promise.all([
        User.findByPk(payment.requesterId, { attributes: ['id', 'full_name'] }),
        User.findByPk(payment.approverId, { attributes: ['id', 'full_name'] })
      ]);
  
      // Fetch the receipts with the corrected query and include seller's PayPal information
      const receipts = await PaymentReceipt.findAll({
        where: { payment_id: paymentId },
        attributes: [
          'id', 'tax', 'price', 'total', 'user_id', 'item_type', 'item_id', 'seller_id',
          [
            literal(`CASE 
              WHEN "PaymentReceipt"."item_type" = 'Song' OR "PaymentReceipt"."item_type" = 'Podcast' THEN (SELECT name FROM medias WHERE id = "PaymentReceipt"."item_id")
              WHEN "PaymentReceipt"."item_type" = 'Album' THEN (SELECT name FROM playlists WHERE id = "PaymentReceipt"."item_id")
              ELSE NULL
            END`),
            'item_name'
          ]
        ],
        include: [
          { model: User, as: 'Buyer', attributes: ['id', 'full_name'] },
          { 
            model: User, 
            as: 'Seller', 
            attributes: ['id', 'full_name', 'paypalEmail', 'paypalAccountId'] 
          }
        ]
      });
  
      // Construct the response
      const paymentDetails = {
        id: payment.id,
        totalAmount: payment.totalAmount,
        status: payment.status,
        requestNote: payment.requestNote,
        approvalNote: payment.approvalNote,
        requestedAt: payment.requestedAt,
        approvedAt: payment.approvedAt,
        completedAt: payment.completedAt,
        requester: requester,
        approver: approver,
        receipts: receipts.map(receipt => ({
          ...receipt.toJSON(),
          Seller: {
            ...receipt.Seller.toJSON(),
            paypalEmail: receipt.Seller.paypalEmail,
            paypalAccountId: receipt.Seller.paypalAccountId
          }
        }))
      };
  
      return res.status(200).json({
        success: true,
        status: 200,
        message: "Successfully retrieved payment details.",
        data: paymentDetails
      });
  
    } catch (error) {
      console.error('Error in getPaymentDetails:', error);
      return res.status(500).json({
        success: false,
        status: 500,
        message: "An error occurred while retrieving the payment details.",
        error: error.message
      });
    }
  }

// [POST] /payments/purchase
static async purchaseItem(req, res) {
    const { itemType, itemId, paymentMethodId } = req.body;
    const userId = req.user.id; // Assuming you have user authentication middleware
  
    try {
      // Attempt to purchase the item using Stripe
      const stripeResult = await stripeModule.purchaseItem(itemType, itemId, userId, paymentMethodId);
      
      if (!stripeResult.success) {
        return res.status(stripeResult.status).json({
          success: false,
          status: stripeResult.status,
          message: stripeResult.message,
          error: stripeResult.error
        });
      }
  
      return res.status(stripeResult.status).json({
        success: true,
        status: stripeResult.status,
        message: stripeResult.message,
        data: {
          paymentId: stripeResult.data.paymentId,
          receiptId: stripeResult.data.receiptId,
          amount: stripeResult.data.amount,
          tax: stripeResult.data.tax,
          sellerId: stripeResult.data.sellerId
        }
      });
  
    } catch (error) {
      console.error('Error in purchaseItem controller:', error);
      return res.status(500).json({
        success: false,
        status: 500,
        message: 'An error occurred while processing the purchase',
        error: error.message
      });
    }
  }

  // [PUT] /payments/approve/:id
  static async approvePayment(req, res) {
    const { id } = req.params;
    const { status, approvalNote } = req.body;
    const approverId = req.user.id; // Assuming you have user authentication middleware

    try {
      const payment = await Payment.findByPk(id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          status: 404,
          message: "Payment request not found.",
          error: "Payment request not found."
        });
      }

      if (payment.status !== 'Requested') {
        return res.status(400).json({
          success: false,
          status: 400,
          message: "This payment request has already been processed.",
          error: "Payment request already processed."
        });
      }

      // Update the payment status
      await payment.update({
        status: status,
        approvalNote: approvalNote,
        approverId: approverId,
        approvedAt: new Date(),
        completedAt: status === 'Approved' ? new Date() : null
      });

      if (status === 'Approved') {
        // Update associated PaymentReceipts
        await PaymentReceipt.update(
          { status: 'Completed' },
          { where: { payment_id: payment.id } }
        );
      }

      // Fetch the updated payment with associated data
      const updatedPayment = await Payment.findByPk(id, {
        include: [
          {
            model: User,
            as: 'requester',
            attributes: ['id', 'full_name'],
          },
          {
            model: User,
            as: 'approver',
            attributes: ['id', 'full_name'],
          },
          {
            model: PaymentReceipt,
            as: 'receipts',
            include: [
              {
                model: User,
                as: 'Buyer',
                attributes: ['id', 'full_name'],
              },
              {
                model: User,
                as: 'Seller',
                attributes: ['id', 'full_name'],
              },
              {
                model: Media,
                as: 'MediaItem',
                attributes: ['id', 'name'],
                required: false
              },
              {
                model: Playlist,
                as: 'PlaylistItem',
                attributes: ['id', 'name'],
                required: false
              }
            ],
          }
        ],
      });

      return res.status(200).json({
        success: true,
        status: 200,
        message: `Payment request ${status.toLowerCase()} successfully.`,
        data: updatedPayment
      });

    } catch (error) {
      console.error('Error in approvePayment:', error);
      return res.status(500).json({
        success: false,
        status: 500,
        message: "An error occurred while processing the payment request.",
        error: error.message
      });
    }
  }

      // [POST] /payments/request
      static async requestPayment(req, res) {
        const { paymentId } = req.body;
        const requesterId = req.user.id; // Assuming you have user authentication middleware
    
        try {
          // Find the existing payment
          const payment = await Payment.findByPk(paymentId);
    
          if (!payment) {
            return res.status(404).json({
              success: false,
              status: 404,
              message: "Payment not found.",
            });
          }
    
          if (payment.requesterId !== requesterId) {
            return res.status(403).json({
              success: false,
              status: 403,
              message: "You are not authorized to request this payment.",
            });
          }
    
          // Update the payment status to 'Requested'
          await payment.update({ status: 'Requested', requestedAt: new Date() });
    
          // Fetch the updated payment with associated data
          const updatedPayment = await Payment.findByPk(paymentId, {
            include: [
              {
                model: User,
                as: 'requester',
                attributes: ['id', 'full_name'],
              },
              {
                model: PaymentReceipt,
                as: 'receipts',
                include: [
                  {
                    model: User,
                    as: 'Buyer',
                    attributes: ['id', 'full_name'],
                  },
                  {
                    model: User,
                    as: 'Seller',
                    attributes: ['id', 'full_name'],
                  }
                ],
              }
            ],
          });
    
          return res.status(200).json({
            success: true,
            status: 200,
            message: "Payment status updated to Requested successfully.",
            data: updatedPayment
          });
    
        } catch (error) {
          console.error('Error in requestPayment:', error);
          return res.status(500).json({
            success: false,
            status: 500,
            message: "An error occurred while updating the payment status.",
            error: error.message
          });
        }
      }

      // [GET] /payments/user/:userId/receipts
      static async getUserPaymentReceipts(req, res) {
        try {
          const { userId } = req.params;
          const userIdInt = parseInt(userId, 10);
    
          if (isNaN(userIdInt)) {
            return res.status(400).json({
              success: false,
              status: 400,
              message: "Invalid user ID.",
            });
          }
    
          const receipts = await PaymentReceipt.findAll({
            where: { user_id: userIdInt },
            include: [
              {
                model: User,
                as: 'Buyer',
                attributes: ['id', 'full_name'],
              },
              {
                model: User,
                as: 'Seller',
                attributes: ['id', 'full_name'],
              },
              {
                model: Media,
                as: 'MediaItem',
                attributes: ['id', 'name', 'media_type'],
                required: false,
              },
              {
                model: Playlist,
                as: 'PlaylistItem',
                attributes: ['id', 'name', 'type'],
                required: false,
              },
              {
                model: Payment,
                as: 'Payment',
                attributes: ['id', 'status', 'requestedAt', 'approvedAt', 'completedAt'],
              },
            ],
            attributes: [
              'id', 'tax', 'price', 'total', 'status', 'item_type', 'item_id', 'created_at', 'updated_at',
              [
                literal(`CASE 
                  WHEN "PaymentReceipt"."item_type" = 'Song' OR "PaymentReceipt"."item_type" = 'Podcast' THEN "MediaItem"."name"
                  WHEN "PaymentReceipt"."item_type" = 'Album' THEN "PlaylistItem"."name"
                  ELSE NULL
                END`),
                'item_name'
              ]
            ],
            order: [['created_at', 'DESC']], // Sort by newest first
          });
    
          return res.status(200).json({
            success: true,
            status: 200,
            message: receipts.length === 0 ? "No payment receipts found for this user." : "Successfully retrieved user's payment receipts.",
            data: receipts
          });
    
        } catch (error) {
          console.error('Error in getUserPaymentReceipts:', error);
          return res.status(500).json({
            success: false,
            status: 500,
            message: "An error occurred while retrieving the user's payment receipts.",
            error: error.message
          });
        }
      }

}



module.exports = PaymentController;
const User = require('../models/User');
const Payment = require('../models/Payment');
const PaymentReceipt = require('../models/PaymentReceipt');
const Media = require('../models/Media');
const Comment = require('../models/Comment');
const UserFollow = require('../models/UserFollow');
const { Op, literal, fn, QueryTypes, query } = require('sequelize');
const { sequelize } = require('../../config/dbconfig');

class DashboardController {
  static async getUserStats(req, res) {
    try {
      const totalUsers = await User.count();
      const activeUsers = await User.count({ where: { status: 'Active' } });
      const vipUsers = await User.count({ where: { role: 'Vip User' } });

      return res.json({
        success: true,
        status: 200,
        message: "User statistics retrieved successfully.",
        data: {
          totalUsers,
          activeUsers,
          vipUsers
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        status: 500,
        message: "An error occurred while retrieving user statistics.",
        error: error.message
      });
    }
  }

  static async getPaymentStats(req, res) {
    try {
      const totalPayments = await Payment.count();
      const completedPayments = await Payment.count({ where: { status: 'Completed' } });
      
      const [totalRevenueResult] = await sequelize.query(`
        SELECT COALESCE(SUM(
          CASE 
            WHEN pr.item_type = 'VIP Subscription' THEN pr.total
            ELSE pr.tax
          END
        ), 0) as total_revenue
        FROM payment_receipts pr
        JOIN payments p ON pr.payment_id = p.id
        WHERE pr."deletedAt" IS NULL
          AND p.status IN ('Completed', 'Approved')
      `, { type: QueryTypes.SELECT });

      const totalRevenue = parseFloat(totalRevenueResult.total_revenue) || 0;

      return res.json({
        success: true,
        status: 200,
        message: "Payment statistics retrieved successfully.",
        data: {
          totalPayments,
          completedPayments,
          totalRevenue
        }
      });
    } catch (error) {
      console.error('Error in getPaymentStats:', error);
      return res.status(500).json({
        success: false,
        status: 500,
        message: "An error occurred while retrieving payment statistics.",
        error: error.message
      });
    }
  }

  static async getMediaStats(req, res) {
    try {
      const totalMedia = await Media.count();
      const totalSongs = await Media.count({ where: { media_type: 'Song' } });
      const totalPodcasts = await Media.count({ where: { media_type: 'Podcast' } });

      return res.json({
        success: true,
        status: 200,
        message: "Media statistics retrieved successfully.",
        data: {
          totalMedia,
          totalSongs,
          totalPodcasts
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        status: 500,
        message: "An error occurred while retrieving media statistics.",
        error: error.message
      });
    }
  }

  static async getInteractionStats(req, res) {
    try {
      const totalComments = await Comment.count();
      const totalFollows = await UserFollow.count();

      return res.json({
        success: true,
        status: 200,
        message: "Interaction statistics retrieved successfully.",
        data: {
          totalComments,
          totalFollows
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        status: 500,
        message: "An error occurred while retrieving interaction statistics.",
        error: error.message
      });
    }
  }

  static async getRecentActivity(req, res) {
    try {
      const recentPayments = await Payment.findAll({
        where: { status: 'Requested' },
        limit: 5,
        order: [['created_at', 'DESC']],
        include: [{ model: User, as: 'requester', attributes: ['full_name'] }]
      });

      const recentMedia = await Media.findAll({
        limit: 5,
        order: [['created_at', 'DESC']],
        attributes: ['id', 'name', 'media_type', 'created_at']
      });

      return res.json({
        success: true,
        status: 200,
        message: "Recent activity retrieved successfully.",
        data: {
          recentPayments,
          recentMedia
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        status: 500,
        message: "An error occurred while retrieving recent activity.",
        error: error.message
      });
    }
  }
}

module.exports = DashboardController;


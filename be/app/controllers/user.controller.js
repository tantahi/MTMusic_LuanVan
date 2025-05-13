const User = require('../models/User');
const PaymentReceipt = require('../models/PaymentReceipt');
const Media = require('../models/Media');
const Report = require('../models/Report');
const Playlist = require('../models/Playlist');
const Payment = require('../models/Payment');
const { Op, literal, col } = require('sequelize');

class UserController {
  // [GET] /users/all-vip-info
  static async getAllVipUsersInfo(req, res) {
    try {
      const User = require('../models/User');
      const PaymentReceipt = require('../models/PaymentReceipt');
      const Payment = require('../models/Payment');
      const Media = require('../models/Media');
      const Playlist = require('../models/Playlist');
      const { Op } = require('sequelize');
  
      const vipUsers = await User.findAll({
        where: {
          role: 'Vip User'
        },
        attributes: ['id', 'email', 'full_name', 'status', 'vip_start_date', 'vip_end_date', 'report_count']
      });
  
      if (!vipUsers.length) {
        return res.status(404).json({
          success: false,
          status: 404,
          message: "No VIP users found.",
          data: null
        });
      }
  
      const vipUsersInfo = await Promise.all(vipUsers.map(async (user) => {
        const userId = user.id;
  
        // Calculate total earnings for this specific user
        // const totalEarnings = await PaymentReceipt.sum('price', {
        //   where: {
        //     seller_id: userId
        //   },
        //   include: [{
        //     model: Payment,
        //     where: {
        //       status: 'Approved' || 'Completed',
        //     },
        //     attributes: []
        //   }]
        // }) - await PaymentReceipt.sum('tax', {
        //     where: {
        //       seller_id: userId
        //     },});
        const totalEarnings = await Payment.sum('totalAmount', {
            where: {
                requesterId: userId,
                status: 'Approved'
            }
        })
  
        // Count payments by status for this user
        const [completedPaymentsCount, pendingPaymentsCount, rejectedPaymentsCount] = await Promise.all([
          Payment.count({
            where: {
              requesterId: userId,
              status: 'Completed'
            }
          }),
          Payment.count({
            where: {
              requesterId: userId,
              status: 'Pending'
            }
          }),
          Payment.count({
            where: {
              requesterId: userId,
              status: 'Rejected'
            }
          })
        ]);
  
        // Count media with prices for this user
        const [songCount, podcastCount, albumCount] = await Promise.all([
          Media.count({
            where: {
              createdBy: userId,
              media_type: 'Song',
              price: {
                [Op.not]: null
              }
            }
          }),
          Media.count({
            where: {
              createdBy: userId,
              media_type: 'Podcast',
              price: {
                [Op.not]: null
              }
            }
          }),
          Playlist.count({
            where: {
              user_id: userId,
              type: 'Album',
              price: {
                [Op.not]: null
              }
            }
          })
        ]);
  
        return {
          ...user.toJSON(),
          totalEarnings: totalEarnings,
          completedPaymentsCount,
          pendingPaymentsCount,
          rejectedPaymentsCount,
          pricedSongsCount: songCount,
          pricedPodcastsCount: podcastCount,
          pricedAlbumsCount: albumCount
        };
      }));
  
      return res.status(200).json({
        success: true,
        status: 200,
        message: "Successfully retrieved all VIP users' profile information.",
        data: vipUsersInfo
      });
  
    } catch (error) {
      console.error('Error in getAllVipUsersInfo:', error);
      return res.status(500).json({
        success: false,
        status: 500,
        message: "An error occurred while fetching VIP users' information.",
        error: error.message
      });   
    }
  }

  // [GET] /users/vip-user/:id
  static async getVipUserDetails(req, res) {
    try {
      const userId = req.params.id;
  
      const user = await User.findOne({
        where: {
          id: userId,
          role: 'Vip User'
        },
        attributes: ['id', 'email', 'full_name', 'img_url', 'status', 'report_count', 'vip_start_date', 'vip_end_date', 'report_count', 'role']
      });
  
      if (!user) {
        return res.status(404).json({
          success: false,
          status: 404,
          message: "VIP user not found.",
          data: null
        });
      }
  
      // Fetch songs with sales count, likes count, comments count, and report count
      const songs = await Media.findAll({
        where: {
          createdBy: userId,
          media_type: 'Song',
          price: {
            [Op.not]: null
          }
        },
        attributes: [
          'id', 'name', 'price',
          [literal(`(SELECT COUNT(*) FROM payments JOIN payment_receipts ON payments.id = payment_receipts.payment_id WHERE payment_receipts.item_type = 'Song' AND payment_receipts.item_id = "Media"."id" AND payments.status = 'Approved')`), 'sales_count'],
          [literal(`(SELECT COUNT(*) FROM likes WHERE likeable_type = 'Media' AND likeable_id = "Media"."id")`), 'likes_count'],
          [literal(`(SELECT COUNT(*) FROM comments WHERE media_id = "Media"."id")`), 'comments_count'],
          [literal(`(SELECT COUNT(*) FROM reports WHERE post_id = "Media"."id")`), 'report_count']
        ]
      });
  
      // Fetch albums with sales count and likes count
      const albums = await Playlist.findAll({
        where: {
          user_id: userId,
          type: 'Album',
          price: {
            [Op.not]: null
          }
        },
        attributes: [
          'id', 'name', 'price',
          [literal(`(SELECT COUNT(*) FROM payments JOIN payment_receipts ON payments.id = payment_receipts.payment_id WHERE payment_receipts.item_type = 'Album' AND payment_receipts.item_id = "Playlist"."id" AND payments.status = 'Completed')`), 'sales_count'],
          [literal(`(SELECT COUNT(*) FROM likes WHERE likeable_type = 'Playlist' AND likeable_id = "Playlist"."id")`), 'likes_count'],
          [literal(`(SELECT COUNT(*) FROM "playlist_items" WHERE playlist_id = "Playlist"."id")`), 'songs_count']
        ]
      });
  
      // Fetch podcasts with sales count, likes count, comments count, and report count
      const podcasts = await Media.findAll({
        where: {
          createdBy: userId,
          media_type: 'Podcast',
          price: {
            [Op.not]: null
          }
        },
        attributes: [
          'id', 'name', 'price',
          [literal(`(SELECT COUNT(*) FROM payments JOIN payment_receipts ON payments.id = payment_receipts.payment_id WHERE payment_receipts.item_type = 'Podcast' AND payment_receipts.item_id = "Media"."id" AND payments.status = 'Completed')`), 'sales_count'],
          [literal(`(SELECT COUNT(*) FROM likes WHERE likeable_type = 'Media' AND likeable_id = "Media"."id")`), 'likes_count'],
          [literal(`(SELECT COUNT(*) FROM comments WHERE media_id = "Media"."id")`), 'comments_count'],
          [literal(`(SELECT COUNT(*) FROM reports WHERE post_id = "Media"."id")`), 'report_count']
        ]
      });
  
      // Calculate total earnings
      const totalEarnings = await PaymentReceipt.sum('price', {
        where: {
          seller_id: userId
        },
        include: [{
          model: Payment,
          where: {
            status: 'Approved' || 'Completed'
          },
          attributes: [] // This will exclude all Payment attributes from the query
        }]
      }) - await PaymentReceipt.sum('tax', {
        where: {
          seller_id: userId
        },});
  
      const userDetails = {
        ...user.toJSON(),
        songs,
        albums,
        podcasts,
        totalEarnings: totalEarnings || 0
      };
  
      return res.status(200).json({
        success: true,
        status: 200,
        message: "Successfully retrieved VIP user profile information.",
        data: userDetails
      });
  
    } catch (error) {
      console.error('Error in getVipUserDetails:', error);
      return res.status(500).json({
        success: false,
        status: 500,
        message: "An error occurred while fetching VIP user details.",
        error: error.message
      });
    }
  }
  // [GET] /users/all-staff
  static async getStaffList(req, res) {
    try {
      const staffList = await User.findAll({
        where: {
          role: 'Staff',
        },
        attributes: ['id', 'email', 'full_name', 'status', 'created_at'],
      });

      if (!staffList.length) {
        return res.status(404).json({
          success: false,
          status: 404,
          message: "No staff members found.",
          data: null
        });
      }

      const staffListWithCounts = await Promise.all(staffList.map(async (staff) => {
        const processedMediaCount = await Media.count({
          where: {
            approvedBy: staff.id,
            status: {
              [Op.in]: ['Approved', 'Rejected']
            }
          }
        });

        const processedReportsCount = await Report.count({
          where: {
            approvedBy: staff.id,
            status: {
              [Op.in]: ['Accepted', 'Rejected']
            }
          }
        });

        const processedPaymentsCount = await Payment.count({
          where: {
            approverId: staff.id,
            status: {
              [Op.in]: ['Approved', 'Rejected', 'Completed']
            }
          }
        });

        return {
          ...staff.toJSON(),
          processedMediaCount,
          processedReportsCount,
          processedPaymentsCount
        };
      }));

      return res.status(200).json({
        success: true,
        status: 200,
        message: "Staff list retrieved successfully.",
        data: staffListWithCounts
      });

    } catch (error) {
      console.error('Error in getStaffList:', error);
      return res.status(500).json({
        success: false,
        status: 500,
        message: "An error occurred while fetching the staff list.",
        error: error.message
      });
    }
  }
}

module.exports = UserController;
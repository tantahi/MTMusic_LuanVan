const { Op, literal, fn } = require('sequelize');
const Report = require('../models/Report');
const Media = require('../models/Media');
const User = require('../models/User');

class ReportController {
    // [POST] /reports
    static async createReport(req, res) {
        try {
            const { post_id, user_id, report_type, description } = req.body;

            // Check if the post and user exist
            const media = await Media.findByPk(post_id);
            const user = await User.findByPk(user_id);

            if (!media || !user) {
                return res.status(404).json({
                    success: false,
                    status: 404,
                    message: 'Media or User not found',
                    data: null
                });
            }

            // Check if the user has already reported this post
            const existingReport = await Report.findOne({
                where: {
                    post_id,
                    user_id
                }
            });

            if (existingReport) {
                return res.status(400).json({
                    success: false,
                    status: 400,
                    message: 'You have already reported this post',
                    data: null
                });
            }

            // Create the new report
            const report = await Report.create({
                post_id,
                user_id,
                report_type,
                description,
                status: 'Pending',
                created_at: new Date()
            });

            // Increment the reports_count for the media
            // await Media.increment('reports_count', { where: { id: post_id } });

            res.status(201).json({
                success: true,
                status: 201,
                message: 'Report created successfully',
                data: report
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                status: 500,
                message: 'Error creating report',
                data: null
            });
        }
    }

  // [GET] /reports
  static async getAllReports(req, res) {
    try {
      const pendingReports = await Media.findAll({
        attributes: [
          'id',
          'name',
          'artist_name',
          'likes_count',
          'media_type',
          'price',
          [literal('(SELECT COUNT(*) FROM reports WHERE reports.post_id = "Media".id AND reports.status = \'Pending\')'), 'report_count'],
          [literal('(SELECT full_name FROM users WHERE users.id = "Media"."createdBy")'), 'author']
        ],
        where: {
          [Op.and]: [
            literal('(SELECT COUNT(*) FROM reports WHERE reports.post_id = "Media".id AND reports.status = \'Pending\') > 0')
          ]
        },
        order: [
          [literal('(SELECT COUNT(*) FROM reports WHERE reports.post_id = "Media".id AND reports.status = \'Pending\')'), 'DESC']
        ]
      });

      const formattedReports = pendingReports.map(media => ({
        id: media.id,
        name: media.name,
        artist_name: media.artist_name,
        media_type: media.media_type,
        author: media.get('author'),
        report_count: parseInt(media.get('report_count')),
        likes_count: media.likes_count,
        price: media.price
      }));

      res.status(200).json({
        success: true,
        status: 200,
        message: 'Pending reports retrieved successfully',
        data: formattedReports
      });
    } catch (error) {
      console.error('Error fetching pending reports:', error);
      res.status(500).json({
        success: false,
        status: 500,
        message: 'Error fetching pending reports',
        data: null
      });
    }
  }


    // [GET] /reports/media/:id
    static async getReportsByMediaId(req, res) {
        try {
          const { id } = req.params;
    
          const reports = await Report.findAll({
            where: { post_id: id },
            include: [
              {
                model: Media,
                as: 'Media'
              },
              {
                model: User,
                as: 'User'
              }
            ],
            order: [['created_at', 'DESC']]
          });
    
          if (reports.length === 0) {
            return res.status(404).json({
              success: false,
              status: 404,
              message: 'No reports found for this media.',
              data: null
            });
          }
    
          res.status(200).json({
            success: true,
            status: 200,
            message: 'Reports retrieved successfully.',
            data: reports
          });
        } catch (error) {
          console.error('Error fetching reports:', error);
          res.status(500).json({
            success: false,
            status: 500,
            message: 'Error fetching reports.',
            data: null
          });
        }
      }

    // [DELETE] /reports/:id
    static async deleteReport(req, res) {
        try {
            const report = await Report.findByPk(req.params.id);
            
            if (!report) {
                return res.status(404).json({
                    success: false,
                    status: 404,
                    message: 'Report not found',
                    data: null
                });
            }

            await report.destroy();
            res.status(200).json({
                success: true,
                status: 200,
                message: 'Report deleted successfully',
                data: null
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                status: 500,
                message: 'Error deleting report',
                data: null
            });
        }
    }

  // [PUT] /reports/:id
  static async updateReportStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, approvedBy } = req.body;

      // Validate status
      const validStatuses = ['Pending', 'Rejected', 'Accepted'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          status: 400,
          message: 'Invalid status. Must be Pending, Rejected, or Accepted.',
          data: null
        });
      }

      // Find the report
      const report = await Report.findByPk(id);

      if (!report) {
        return res.status(404).json({
          success: false,
          status: 404,
          message: 'Report not found',
          data: null
        });
      }

      const oldStatus = report.status;

      // Update the report
      report.status = status;
      report.approvedBy = approvedBy;
      await report.save();

      // Find the associated media
      const media = await Media.findByPk(report.post_id);

      if (media) {
        // Update reports_count based on status change
        if (status === 'Accepted' && oldStatus !== 'Accepted') {
          media.reports_count += 1;
        } else if (status !== 'Accepted' && oldStatus === 'Accepted') {
          media.reports_count = Math.max(0, media.reports_count - 1); // Ensure it doesn't go below 0
        }

        let userToUpdate = null;

        // Check if the number of accepted reports is greater than 15
        if (status === 'Accepted') {
          const acceptedReportsCount = await Report.count({
            where: {
              post_id: media.id,
              status: 'Accepted'
            }
          });

          if (acceptedReportsCount > 15) {
            const oldMediaStatus = media.status;
            media.status = 'Reported';

            // If the media status has changed to 'Reported', update the user's report_count
            if (oldMediaStatus !== 'Reported') {
              userToUpdate = await User.findByPk(media.createdBy);
            }
          }
        }

        await media.save();

        // Update user's report_count if necessary
        if (userToUpdate) {
          const reportedMediaCount = await Media.count({
            where: {
              createdBy: userToUpdate.id,
              status: 'Reported'
            }
          });

          userToUpdate.report_count = reportedMediaCount;
          await userToUpdate.save();
        }
      }

      // Fetch the updated report with associated data
      const updatedReport = await Report.findOne({
        where: { id },
        include: [
          {
            model: Media,
            as: 'Media'
          },
          {
            model: User,
            as: 'User'
          }
        ]
      });

      res.status(200).json({
        success: true,
        status: 200,
        message: 'Report status updated successfully',
        data: updatedReport
      });
    } catch (error) {
      console.error('Error updating report status:', error);
      res.status(500).json({
        success: false,
        status: 500,
        message: 'Error updating report status',
        data: null
      });
    }
  }
}

module.exports = ReportController;
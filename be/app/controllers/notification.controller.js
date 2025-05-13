const Media = require('../models/Media');
const User = require('../models/User');
const Notification = require('../models/Notification');
const NotificationItem = require('../models/NotificationItem');
class NotificationController {
    // [POST] /notifications
    static async sendSystemNotification(req, res) {
        const { content, related_item_id, related_item_type, action } = req.body;

        try {
            // Lấy tất cả người dùng (có thể áp dụng bộ lọc người dùng nếu cần thiết)
            const users = await User.findAll();

            if (!users || users.length === 0) {
                return res.status(404).json({ message: 'Không có người dùng nào trong hệ thống.' });
            }

            // Tạo thông báo hệ thống cho từng người dùng
            const notificationPromises = users.map(async (user) => {
                // Tạo thông báo chính cho người dùng
                const notification = await Notification.create({
                    receiver_id: user.id,
                    sender_id: null, // Bạn có thể cập nhật nếu có sender_id cụ thể
                    content,
                    notification_type: 'System',
                    is_read: false,
                    created_at: new Date()
                });

                // Tạo NotificationItem tương ứng nếu có liên kết đến item
                if (related_item_id && related_item_type) {
                    await NotificationItem.create({
                        notification_id: notification.id,
                        related_item_id,
                        related_item_type,
                        action,
                        created_at: new Date()
                    });
                }

                return notification;
            });

            // Chờ tất cả các thông báo được tạo
            await Promise.all(notificationPromises);

            res.status(201).json({
                success: true,
                status: 201,
                message: 'Thông báo đã được gửi thành công tới tất cả người dùng.'
            });
        } catch (error) {
            console.error('Lỗi khi gửi thông báo:', error);
            res.status(500).json({ success: false, message: 'Có lỗi xảy ra khi gửi thông báo.' });
        }
    }

    // [GET] /notifications/:userId
    static async getUserNotifications(req, res) {
        const userId = req.params.userId;

        try {
            const notifications = await Notification.findAll({
                where: { receiver_id: userId },
                order: [['created_at', 'DESC']], // Sắp xếp theo thời gian tạo
            });

            if (!notifications || notifications.length === 0) {
                return res.status(404).json({ message: 'Không có thông báo nào cho người dùng này.' });
            }

            res.status(200).json({
                success: true,
                status: 200,
                notifications,
            });
        } catch (error) {
            console.error('Lỗi khi lấy thông báo:', error);
            res.status(500).json({ success: false, message: 'Có lỗi xảy ra khi lấy thông báo.' });
        }
    }

    // [PUT] /notifications/:notificationId/read
    static async markNotificationAsRead(req, res) {
        const notificationId = req.params.notificationId;

        try {
            const notification = await Notification.findByPk(notificationId);

            if (!notification) {
                return res.status(404).json({ message: 'Thông báo không tồn tại.' });
            }

            notification.is_read = true;
            await notification.save();

            res.status(200).json({
                success: true,
                status: 200,
                message: 'Thông báo đã được đánh dấu là đã đọc.',
                notification,
            });
        } catch (error) {
            console.error('Lỗi khi đánh dấu thông báo:', error);
            res.status(500).json({ success: false, message: 'Có lỗi xảy ra khi đánh dấu thông báo.' });
        }
    }

    // [DELETE] /notifications/:notificationId
    static async deleteNotification(req, res) {
        const notificationId = req.params.notificationId;

        try {
            const notification = await Notification.findByPk(notificationId);

            if (!notification) {
                return res.status(404).json({ message: 'Thông báo không tồn tại.' });
            }

            await notification.destroy();

            res.status(200).json({
                success: true,
                status: 200,
                message: 'Thông báo đã được xóa thành công.',
            });
        } catch (error) {
            console.error('Lỗi khi xóa thông báo:', error);
            res.status(500).json({ success: false, message: 'Có lỗi xảy ra khi xóa thông báo.' });
        }
    }
}

module.exports = NotificationController;

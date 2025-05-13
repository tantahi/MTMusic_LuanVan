const express = require('express');
const router = express.Router();
const NotificationController = require('../app/controllers/notification.controller');
const authenticateToken = require('../app/middlewares/verify.middleware');

// [POST] /notifications - Gửi thông báo hệ thống
router.post('/', authenticateToken, (req, res) => {
    NotificationController.sendSystemNotification(req, res).catch((error) => {
        console.error('Send System Notification Error:', error);
        res.status(500).json({
            success: false,
            status: 500,
            error: {
                name: 'server_error',
                message: 'Failed to send system notification',
                status: 500,
            },
        });
    });
});

// [GET] /notifications/:userId - Lấy thông báo của người dùng
router.get('/:userId', authenticateToken, (req, res) => {
    NotificationController.getUserNotifications(req, res).catch((error) => {
        console.error('Get User Notifications Error:', error);
        res.status(500).json({
            success: false,
            status: 500,
            error: {
                name: 'server_error',
                message: 'Failed to retrieve user notifications',
                status: 500,
            },
        });
    });
});

// [PUT] /notifications/:notificationId/read - Đánh dấu thông báo đã đọc
router.put('/:notificationId/read', authenticateToken, (req, res) => {
    NotificationController.markNotificationAsRead(req, res).catch((error) => {
        console.error('Mark Notification as Read Error:', error);
        res.status(500).json({
            success: false,
            status: 500,
            error: {
                name: 'server_error',
                message: 'Failed to mark notification as read',
                status: 500,
            },
        });
    });
});

// [DELETE] /notifications/:notificationId - Xóa thông báo
router.delete('/:notificationId', authenticateToken, (req, res) => {
    NotificationController.deleteNotification(req, res).catch((error) => {
        console.error('Delete Notification Error:', error);
        res.status(500).json({
            success: false,
            status: 500,
            error: {
                name: 'server_error',
                message: 'Failed to delete notification',
                status: 500,
            },
        });
    });
});

module.exports = router;
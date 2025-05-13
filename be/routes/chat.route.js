const express = require('express');
const router = express.Router();
const ChatController = require('../app/controllers/chat.controller');
const authenticateToken = require('../app/middlewares/verify.middleware');
const { validationResult } = require('express-validator');

// Helper function to handle validation errors
const handleValidationErrors = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            status: 422,
            error: {
                name: 'validation_error',
                message: 'Validation failed',
                status: 422,
                details: errors.array(),
            },
        });
    }
};

// [POST] /chat/send - Gửi tin nhắn mới
router.post('/send', (req, res) => {
    if (handleValidationErrors(req, res)) return;

    ChatController.sendMessage(req, res).catch((error) => {
        console.error('Send Message Error:', error);
        res.status(500).json({
            success: false,
            status: 500,
            error: {
                name: 'server_error',
                message: 'Failed to send message',
                status: 500,
            },
        });
    });
});

// [GET] /chat/conversation/:userId/:receiverId - Lấy cuộc hội thoại giữa hai người dùng
router.get('/conversation/:userId/:receiverId', (req, res) => {
    ChatController.getConversation(req, res).catch((error) => {
        console.error('Get Conversation Error:', error);
        res.status(500).json({
            success: false,
            status: 500,
            error: {
                name: 'server_error',
                message: 'Failed to retrieve conversation',
                status: 500,
            },
        });
    });
});

// [GET] /chat/users/:userId - Lấy danh sách người dùng đã chat với userId
router.get('/users/:userId', authenticateToken, (req, res) => {
    ChatController.getChatUsers(req, res).catch((error) => {
        console.error('Get Chat Users Error:', error);
        res.status(500).json({
            success: false,
            status: 500,
            error: {
                name: 'server_error',
                message: 'Failed to retrieve chat users list',
                status: 500,
            },
        });
    });
})

module.exports = router;

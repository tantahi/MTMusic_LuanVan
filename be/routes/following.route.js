const express = require('express');
const router = express.Router();
const FollowController = require('../app/controllers/following.controller');
const authenticateToken = require('../app/middlewares/verify.middleware');

// [GET] /profile/:userId - Lấy thông tin trang cá nhân của người dùng
router.get('/profile/:userId', (req, res) => {
    FollowController.getUserProfile(req, res).catch((error) => {
        console.error('Get User Profile Error:', error);
        res.status(500).json({
            success: false,
            status: 500,
            error: {
                name: 'server_error',
                message: 'Failed to retrieve user profile',
                status: 500,
            },
        });
    });
});

// [POST] /follow - Theo dõi người dùng
router.post('/follow', authenticateToken, (req, res) => {
    FollowController.followUser(req, res).catch((error) => {
        console.error('Follow User Error:', error);
        res.status(500).json({
            success: false,
            status: 500,
            error: {
                name: 'server_error',
                message: 'Failed to follow user',
                status: 500,
            },
        });
    });
});

// [PUT] /unfollow - Bỏ theo dõi người dùng
router.put('/unfollow', authenticateToken, (req, res) => {
    FollowController.unfollowUser(req, res).catch((error) => {
        console.error('Unfollow User Error:', error);
        res.status(500).json({
            success: false,
            status: 500,
            error: {
                name: 'server_error',
                message: 'Failed to unfollow user',
                status: 500,
            },
        });
    });
});

module.exports = router;

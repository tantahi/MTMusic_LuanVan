const express = require('express');
const router = express.Router();
const FollowController = require('../app/controllers/following.controller'); // Điều chỉnh đường dẫn controllers cho phù hợp
const authenticateToken = require('../app/middlewares/verify.middleware');

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

// [DELETE] /unfollow - Bỏ theo dõi người dùng
router.delete('/unfollow', authenticateToken, (req, res) => {
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

// [GET] /profile/:userId - Lấy thông tin trang cá nhân người dùng
router.get('/:userId', authenticateToken, (req, res) => {
    FollowController.getUserProfile(req, res).catch((error) => {
        console.error('Get User Profile Error:', error);
        res.status(500).json({
            success: false,
            status: 500,
            message: 'Failed to retrieve user profile',
        });
    });
})

module.exports = router;

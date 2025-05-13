const express = require('express');
const router = express.Router();
const UserController = require('../app/controllers/user.controller'); // Adjust the path as needed
const authenticateToken = require('../app/middlewares/verify.middleware');

// [GET] /users/all-vip-info - Get VIP user information
router.get('/all-vip-info', (req, res) => {
    UserController.getAllVipUsersInfo(req, res).catch((error) => {
        console.error('Get VIP Users Info Error:', error);
        res.status(500).json({
            success: false,
            status: 500,
            error: {
                name: 'server_error',
                message: 'Failed to fetch VIP users information',
                status: 500,
            },
        });
    });
});

// [GET] /users/vip-user/:id
router.get('/vip-user/:id', (req, res) => {
    UserController.getVipUserDetails(req, res).catch((error) => {
        console.error('Get VIP User Info Error:', error);
        res.status(500).json({
            success: false,
            status: 500,
            error: {
                name: 'server_error',
                message: 'Failed to fetch VIP user information',
                status: 500,
            },
        });
    });
});

// [GET] /users/vip-user/:id
router.get('/all-staff', (req, res) => {
    UserController.getStaffList(req, res).catch((error) => {
        console.error('Get Staff User Info Error:', error);
        res.status(500).json({
            success: false,
            status: 500,
            error: {
                name: 'server_error',
                message: 'Failed to fetch Staff user information',
                status: 500,
            },
        });
    });
});

// You can add more routes here as needed, following the same pattern

module.exports = router;
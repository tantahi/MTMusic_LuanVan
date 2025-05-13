const express = require('express');
const router = express.Router();
const DashboardController = require('../app/controllers/dashboard.controller');
const authenticateToken = require('../app/middlewares/verify.middleware');

// [GET] /dashboard/user-stats - Get user statistics
router.get('/user-stats', (req, res) => {
    DashboardController.getUserStats(req, res).catch((error) => {
        console.error('Get User Stats Error:', error);
        res.status(500).json({
            success: false,
            status: 500,
            message: 'Failed to retrieve user statistics',
            error: error.message
        });
    });
});

// [GET] /dashboard/payment-stats - Get payment statistics
router.get('/payment-stats', (req, res) => {
    DashboardController.getPaymentStats(req, res).catch((error) => {
        console.error('Get Payment Stats Error:', error);
        res.status(500).json({
            success: false,
            status: 500,
            message: 'Failed to retrieve payment statistics',
            error: error.message
        });
    });
});

// [GET] /dashboard/media-stats - Get media statistics
router.get('/media-stats', (req, res) => {
    DashboardController.getMediaStats(req, res).catch((error) => {
        console.error('Get Media Stats Error:', error);
        res.status(500).json({
            success: false,
            status: 500,
            message: 'Failed to retrieve media statistics',
            error: error.message
        });
    });
});

// [GET] /dashboard/interaction-stats - Get interaction statistics
router.get('/interaction-stats', (req, res) => {
    DashboardController.getInteractionStats(req, res).catch((error) => {
        console.error('Get Interaction Stats Error:', error);
        res.status(500).json({
            success: false,
            status: 500,
            message: 'Failed to retrieve interaction statistics',
            error: error.message
        });
    });
});

// [GET] /dashboard/recent-activity - Get recent activity
router.get('/recent-activity', (req, res) => {
    DashboardController.getRecentActivity(req, res).catch((error) => {
        console.error('Get Recent Activity Error:', error);
        res.status(500).json({
            success: false,
            status: 500,
            message: 'Failed to retrieve recent activity',
            error: error.message
        });
    });
});

module.exports = router;


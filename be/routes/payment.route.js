const express = require('express');
const router = express.Router();
const PaymentController = require('../app/controllers/payment.controller'); // Adjust the path as needed
const authenticateToken = require('../app/middlewares/verify.middleware');

// [GET] /payments/all-payment
router.get('/', (req, res) => {
    PaymentController.getAllPayments(req, res).catch((error) => {
        console.error('Get all payment Info Error:', error);
        res.status(500).json({
            success: false,
            status: 500,
            error: {
                name: 'server_error',
                message: 'Failed to fetch payment information',
                status: 500,
            },
        });
    });
});
router.get('/user/:userId/receipts', PaymentController.getUserPaymentReceipts);
// // [GET] /payments/user/:userId
// router.get('/user/:userId', authenticateToken, PaymentController.getUserPayments);

// [GET] /payments/requested
router.get('/requested', PaymentController.getRequestedPayments);

// [GET] /payments/:id
router.get('/:id', PaymentController.getPaymentDetails);

// // [GET] /payments/lastest
// router.get('/lastest', PaymentController.getLatestPayments);

// [GET] /payments/user/:userId/latest
router.get('/user/:userId/latest', PaymentController.getUserLatestPayments);



// [put] /payments/approve/:id
router.put('/approve/:id', authenticateToken, (req, res) => {
    PaymentController.approvePayment(req, res).catch((error) => {
        console.error('Approve Payment Error:', error);
        res.status(500).json({
            success: false,
            status: 500,
            error: {
                name: 'server_error',
                message: 'Failed to approve Payment request',
                status: 500,
            },
        });
    });
});


// [POST] /payments/purchase
router.post('/purchase', authenticateToken, (req, res) => {
    PaymentController.purchaseItem(req, res).catch((error) => {
        console.error('Purchase Item Error:', error);
        res.status(500).json({
            success: false,
            status: 500,
            error: {
                name: 'server_error',
                message: 'Failed to process the purchase',
                status: 500,
            },
        });
    });
});

// [POST] /payments/request
router.post('/request', authenticateToken, (req, res) => {
    PaymentController.requestPayment(req, res).catch((error) => {
        console.error('Approve Payment Error:', error);
        res.status(500).json({
            success: false,
            status: 500,
            error: {
                name: 'server_error',
                message: 'Failed to request Payment',
                status: 500,
            },
        });
    });
});

// You can add more routes here as needed, following the same pattern

module.exports = router;
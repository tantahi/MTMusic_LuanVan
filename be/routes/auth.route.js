const express = require('express');
const router = express.Router();
const authenticateToken = require('../app/middlewares/verify.middleware');
const AuthController = require('../app/controllers/auth.controller');
const { registerValidation, loginValidation } = require('../app/middlewares/validators/auth.validator');
const { validationResult } = require('express-validator');
const stripeModule = require('../utils/stripe')
const PaymentReceipt = require('../app/models/PaymentReceipt')
const Payment = require('../app/models/Payment')

// [POST] /register
router.post('/register', registerValidation, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            status: 400,
            error: {
                name: "validation",
                message: "Validation failed",
                status: 400,
                details: errors.array(),
            },
        });
    }
    AuthController.register(req, res);
});

// [POST] /login
router.post('/login', loginValidation, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            status: 400,
            error: {
                name: "validation",
                message: "Validation failed",
                status: 400,
                details: errors.array(),
            },
        });
    }
    AuthController.login(req, res);
});

// [GET] /me
router.get('/me', authenticateToken, (req, res) => {
    AuthController.getMe(req, res);
});

// [PATCH] /user/:id/vip - Cập nhật thông tin VIP cho người dùng
router.patch('/user/:id/vip', authenticateToken, (req, res) => {
    AuthController.updateVip(req, res);
});


// [POST] /auth/payment - Payment and VIP update for users
router.post('/payment', authenticateToken, async (req, res) => {
    const { amount, paymentMethodId } = req.body;
    const userId = req.user.id;

    // Validate the required fields
    if (!amount || !paymentMethodId || !userId) {
        return res.status(400).json({
            success: false,
            status: 400,
            message: "Amount, paymentMethodId, and userId are required.",
            error: {
                name: "ValidationError",
                details: "Amount, paymentMethodId, and userId are required.",
            },
        });
    }

    try {
        // Call the payment function in the stripe module
        const paymentResponse = await stripeModule.createPayment(amount, paymentMethodId, userId);

        // Check payment status
        if (paymentResponse.status === 'succeeded') {
            // Calculate tax and total amount
            const tax = amount * 0.1;
            const total = parseFloat(amount);

            // Create a Payment record
            const payment = await Payment.create({
                requesterId: userId,
                totalAmount: total.toFixed(2),
                status: 'Completed',
                requestNote: 'Payment for VIP subscription',
                requestedAt: new Date(),
                completedAt: new Date(),
            });

            // Create a PaymentReceipt record
            const paymentReceipt = await PaymentReceipt.create({
                payment_id: payment.id,  // Set the payment_id field
                seller_id: 1, // administrator id
                tax: tax.toFixed(2),
                price: (amount - tax).toFixed(2),
                total: total.toFixed(2),
                item_type: 'VIP Subscription',
                user_id: userId,
                status: 'Completed',
                description: 'Payment for your VIP subscription',
                created_at: new Date(),
                updated_at: new Date(),
            });

            // Update user's VIP information
            await stripeModule.updateUserVipDates(userId);

            // Return payment receipt and payment details
            return res.status(200).json({
                success: true,
                status: 200,
                message: 'Payment successful',
                data: {
                    payment: {
                        id: payment.id,
                        totalAmount: payment.totalAmount,
                        status: payment.status,
                        requestedAt: payment.requestedAt,
                        completedAt: payment.completedAt,
                    },
                    receipt: paymentReceipt,
                },
            });
        } else {
            return res.status(400).json({
                success: false,
                status: 400,
                message: 'Payment failed',
                error: {
                    name: "PaymentError",
                    details: paymentResponse,
                },
            });
        }
    } catch (error) {
        console.error('Payment error:', error);
        return res.status(500).json({
            success: false,
            status: 500,
            message: "An error occurred while processing the payment.",
            error: {
                name: "ServerError",
                details: error.message,
            },
        });
    }
});

// [PATCH] /auth/user/:id/password - Đổi mật khẩu người dùng
router.put('/user/:id/password', authenticateToken, (req, res) => {
    AuthController.changePassword(req, res);
});

// [PUT] /auth/user/:id - Cập nhật thông tin người dùng
router.put('/user/:id', authenticateToken, (req, res) => {
    AuthController.updateUserInfo(req, res);
});

router.post('/update-avatar', authenticateToken, AuthController.updateAvatar);

router.post('/update-payment', authenticateToken, AuthController.updatePaymentInfo);



module.exports = router;

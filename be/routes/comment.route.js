const express = require('express');
const router = express.Router();
const CommentController = require('../app/controllers/comment.controller');
const { validationResult } = require('express-validator');
const authenticateToken = require('../app/middlewares/verify.middleware');

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

// [POST] /comments - Tạo bình luận mới
router.post('/', authenticateToken, (req, res) => {
    if (handleValidationErrors(req, res)) return;

    CommentController.createComment(req, res).catch((error) => {
        console.error('Create Comment Error:', error);
        res.status(500).json({
            success: false,
            status: 500,
            error: {
                name: 'server_error',
                message: 'Failed to create comment',
                status: 500,
            },
        });
    });
});

// [GET] /comments/:id - Lấy thông tin một bình luận
router.get('/:id', (req, res) => {
    CommentController.getCommentsByMedia(req, res).catch((error) => {
        console.error('Get Comment Error:', error);
        res.status(500).json({
            success: false,
            status: 500,
            error: {
                name: 'server_error',
                message: 'Failed to retrieve comment',
                status: 500,
            },
        });
    });
});

// [DELETE] /comments/:id - Xóa bình luận
router.delete('/:id', authenticateToken, (req, res) => {
    CommentController.deleteComment(req, res).catch((error) => {
        console.error('Delete Comment Error:', error);
        res.status(500).json({
            success: false,
            status: 500,
            error: {
                name: 'server_error',
                message: 'Failed to delete comment',
                status: 500,
            },
        });
    });
});

module.exports = router;

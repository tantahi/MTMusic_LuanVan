const Like = require('../models/Like');

class LikeController {
    // [POST] /likes
    static async likePost(req, res) {
        const { post_id, user_id } = req.body;

        try {
            const like = await Like.create({
                post_id,
                user_id,
                created_at: new Date()
            });

            res.status(201).json({
                success: true,
                status: 201,
                message: 'Post liked successfully',
                like
            });
        } catch (error) {
            console.error('Like Post Error:', error);
            res.status(500).json({
                success: false,
                status: 500,
                message: 'Failed to like post',
                details: error.message
            });
        }
    }

    // [DELETE] /likes/:id
    static async unlikePost(req, res) {
        const { id } = req.params;

        try {
            const like = await Like.findByPk(id);
            if (!like) {
                return res.status(404).json({
                    success: false,
                    status: 404,
                    message: 'Like not found'
                });
            }

            await like.destroy();
            res.status(200).json({
                success: true,
                status: 200,
                message: 'Post unliked successfully'
            });
        } catch (error) {
            console.error('Unlike Post Error:', error);
            res.status(500).json({
                success: false,
                status: 500,
                message: 'Failed to unlike post',
                details: error.message
            });
        }
    }
}

module.exports = LikeController;

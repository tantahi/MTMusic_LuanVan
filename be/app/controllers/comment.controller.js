
const Comment = require('../models/Comment');
const User = require('../models/User');
const Media = require('../models/Media');

class CommentController {
    static async createComment(req, res) {
        const { content, user_id, media_id, parent_comment_id } = req.body;
    
        try {
            // Tạo comment mới
            const comment = await Comment.create({
                content,
                user_id,
                media_id,
                parent_comment_id: parent_comment_id || null,
                created_at: new Date(),
                updated_at: new Date()
            });
    
            // Đếm lại số lượng comment của media
            const commentsCount = await Comment.count({
                where: { media_id }
            });
    
            // Cập nhật comments_count cho media với giá trị đã đếm
            await Media.update(
                { comments_count: commentsCount },
                { where: { id: media_id } }
            );
    
            res.status(201).json({
                success: true,
                status: 201,
                message: 'Comment created successfully',
                comment
            });
        } catch (error) {
            console.error('Create Comment Error:', error);
            res.status(500).json({
                success: false,
                status: 500,
                message: 'Failed to create comment',
                details: error.message
            });
        }
    }
    


    static async getCommentsByMedia(req, res) { 
        const { id } = req.params;
    
        try {
            const comments = await Comment.findAll({
                where: { media_id: id }, // Lấy tất cả bình luận cho media có id
                include: [{
                    model: User, // Bao gồm thông tin người dùng
                    attributes: ['id', 'full_name', 'img_url'] // Chỉ lấy các thuộc tính cần thiết
                }],
                order: [['created_at', 'DESC']] // Sắp xếp theo thời gian tạo mới nhất
            });
    
            // Trả về danh sách bình luận, kể cả khi danh sách trống
            res.status(200).json({
                success: true,
                status: 200,
                comments
            });
        } catch (error) {
            console.error('Get Comments By Media Error:', error);
            res.status(500).json({
                success: false,
                status: 500,
                message: 'Failed to retrieve comments',
                details: error.message
            });
        }
    }
    
    

// [DELETE] /comments/:id
static async deleteComment(req, res) {
    const { id } = req.params;

    try {
        // Tìm comment dựa trên ID
        const comment = await Comment.findByPk(id);
        if (!comment) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: 'Comment not found'
            });
        }

        const media_id = comment.media_id; // Lưu lại media_id trước khi xóa comment

        // Xóa comment
        await comment.destroy();

        // Đếm lại số lượng comment của media
        const commentsCount = await Comment.count({
            where: { media_id }
        });

        // Cập nhật comments_count cho media với giá trị đã đếm
        await Media.update(
            { comments_count: commentsCount },
            { where: { id: media_id } }
        );

        res.status(200).json({
            success: true,
            status: 200,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        console.error('Delete Comment Error:', error);
        res.status(500).json({
            success: false,
            status: 500,
            message: 'Failed to delete comment',
            details: error.message
        });
    }
}


}

module.exports = CommentController;

const UserFollow = require('../models/UserFollow'); // Điều chỉnh đường dẫn models cho phù hợp
const User = require('../models/User'); // Cần để xác thực người dùng
const Media = require('../models/Media'); // Model cho bảng bài hát, cần thêm nếu chưa có

class FollowController {
// [GET] /profile/:userId
static async getUserProfile(req, res) {
    const userId = req.params.userId;
    const { id } = req.query;

    try {
        // Lấy toàn bộ thông tin của user
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại.' });
        }

        // Đếm số lượng người theo dõi userId
        const followersCount = await UserFollow.count({
            where: { following_id: userId },
        });

        // Đếm số lượng người mà userId đang theo dõi
        const followingsCount = await UserFollow.count({
            where: { follower_id: userId },
        });

        // Đếm số lượng bài hát của user
        const songsCount = await Media.count({
            where: { createdBy: userId },
        });

        // Kiểm tra xem người dùng có id có đang follow userId không
        const isFollowing = await UserFollow.findOne({
            where: {
                follower_id: id,
                following_id: userId,
            },
        }) !== null;

        // Trả về kết quả
        res.status(200).json({
            success: true,
            status: 200,
            message: 'Lấy thông tin trang cá nhân thành công.',
            userProfile: {
                user,
                followersCount,
                followingsCount,
                songsCount,
                isFollowing, // Trả về biến isFollowing
            },
        });
    } catch (error) {
        console.error('Lỗi khi lấy thông tin trang cá nhân:', error);
        res.status(500).json({ success: false, message: 'Có lỗi xảy ra khi lấy thông tin trang cá nhân.' });
    }
}

    // [POST] /follow
    static async followUser(req, res) {
        const { follower_id, following_id } = req.body;

        if (follower_id === following_id) {
            return res.status(400).json({ message: 'Bạn không thể theo dõi chính mình.' });
        }

        try {
            // Kiểm tra xem đã tồn tại mối quan hệ theo dõi chưa
            const existingFollow = await UserFollow.findOne({
                where: {
                    follower_id,
                    following_id,
                },
            });

            if (existingFollow) {
                return res.status(400).json({ message: 'Bạn đã theo dõi người dùng này.' });
            }

            // Tạo mối quan hệ theo dõi mới
            await UserFollow.create({
                follower_id,
                following_id,
                created_at: new Date(),
            });

            return res.status(201).json({ message: 'Theo dõi người dùng thành công.' });
        } catch (error) {
            console.error('Lỗi khi theo dõi người dùng:', error);
            return res.status(500).json({ message: 'Có lỗi xảy ra khi theo dõi người dùng.' });
        }
    }

    // [DELETE] /unfollow
    static async unfollowUser(req, res) {
        const { follower_id, following_id } = req.body;

        try {
            // Tìm mối quan hệ theo dõi
            const follow = await UserFollow.findOne({
                where: {
                    follower_id,
                    following_id,
                },
            });

            if (!follow) {
                return res.status(404).json({ message: 'Bạn không theo dõi người dùng này.' });
            }

            // Xóa mối quan hệ theo dõi
            await follow.destroy();

            return res.status(200).json({ message: 'Bỏ theo dõi người dùng thành công.' });
        } catch (error) {
            console.error('Lỗi khi bỏ theo dõi người dùng:', error);
            return res.status(500).json({ message: 'Có lỗi xảy ra khi bỏ theo dõi người dùng.' });
        }
    }
}

module.exports = FollowController;

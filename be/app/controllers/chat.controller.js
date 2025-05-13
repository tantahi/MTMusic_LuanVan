const Message = require('../models/Message'); // Model tin nhắn
const User = require('../models/User'); // Model người dùng

class ChatController {

    // [GET] /chat/users/:userId - Lấy danh sách người dùng đã chat với userId
    static async getChatUsers(req, res) {
        const { userId } = req.params;

        try {
            // Truy vấn tất cả người nhận mà userId đã gửi tin nhắn
            const sentMessages = await Message.findAll({
                where: { sender_id: userId },
                include: [
                    {
                        model: User,
                        as: 'Receiver',
                        attributes: ['id', 'full_name', 'img_url'],
                    }
                ],
            });

            // Truy vấn tất cả người gửi đã nhắn tin đến userId
            const receivedMessages = await Message.findAll({
                where: { receiver_id: userId },
                include: [
                    {
                        model: User,
                        as: 'Sender',
                        attributes: ['id', 'full_name', 'img_url'],
                    }
                ],
            });

            // Lọc và hợp nhất danh sách người dùng đã chat, loại bỏ các bản ghi trùng lặp
            const chatUsers = [
                ...sentMessages.map((msg) => msg.Receiver),
                ...receivedMessages.map((msg) => msg.Sender)
            ];

            // Loại bỏ các id trùng lặp
            const uniqueChatUsers = chatUsers.filter((user, index, self) =>
                index === self.findIndex((u) => u.id === user.id)
            );

            res.status(200).json({
                success: true,
                status: 200,
                message: 'Lấy danh sách người dùng đã chat thành công',
                data: uniqueChatUsers,
            });
        } catch (error) {
            console.error('Lỗi khi lấy danh sách người dùng đã chat:', error);
            res.status(500).json({
                success: false,
                message: 'Không thể lấy danh sách người dùng đã chat',
            });
        }
    }
    // [POST] /chat/send
    static async sendMessage(req, res) {
        const { sender_id, receiver_id, content } = req.body;

        try {
            const message = await Message.create({
                sender_id,
                receiver_id,
                content,
                sent_at: new Date(),
            });

            // Phát tin nhắn đến client thông qua socket.io
            req.app.get('io').emit('receiveMessage', message);

            res.status(201).json({
                success: true,
                status: 201,
                message: 'Tin nhắn đã được gửi thành công',
                data: message,
            });
        } catch (error) {
            console.error('Lỗi khi gửi tin nhắn:', error);
            res.status(500).json({
                success: false,
                message: 'Gửi tin nhắn không thành công',
            });
        }
    }

    // [GET] /chat/conversation/:userId/:receiverId - Lấy cuộc hội thoại giữa hai người dùng
    static async getConversation(req, res) {
        const { userId, receiverId } = req.params;

        try {
            // Lấy thông tin người gửi và người nhận
            const sender = await User.findByPk(userId, {
                attributes: ['id', 'full_name', 'img_url'],
            });
            const receiver = await User.findByPk(receiverId, {
                attributes: ['id', 'full_name', 'img_url'],
            });

            if (!sender || !receiver) {
                return res.status(404).json({
                    success: false,
                    status: 404,
                    message: 'Không tìm thấy người gửi hoặc người nhận',
                });
            }

            // Lấy tin nhắn từ userId gửi đến receiverId
            const sentMessages = await Message.findAll({
                where: {
                    sender_id: userId,
                    receiver_id: receiverId,
                },
                order: [['sent_at', 'ASC']],
            });

            // Lấy tin nhắn từ receiverId gửi đến userId
            const receivedMessages = await Message.findAll({
                where: {
                    sender_id: receiverId,
                    receiver_id: userId,
                },
                order: [['sent_at', 'ASC']],
            });

            // Kết hợp hai mảng tin nhắn và sắp xếp theo thời gian
            const allMessages = [...sentMessages, ...receivedMessages];
            allMessages.sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at));

            res.status(200).json({
                success: true,
                status: 200,
                message: 'Cuộc hội thoại đã được lấy thành công',
                data: {
                    sender: {
                        id: sender.id,
                        name: sender.full_name,
                        avatar: sender.img_url,
                    },
                    receiver: {
                        id: receiver.id,
                        name: receiver.full_name,
                        avatar: receiver.img_url,
                    },
                    messages: allMessages,
                },
            });
        } catch (error) {
            console.error('Lỗi khi lấy cuộc hội thoại:', error);
            res.status(500).json({
                success: false,
                message: 'Không thể lấy cuộc hội thoại',
            });
        }
    }
}

module.exports = ChatController;

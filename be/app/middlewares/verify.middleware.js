const { verifyToken } = require('../../utils/jwt');
const User = require('../models/User');  // Đảm bảo đã import model User đúng cách

async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1] || req.cookies?.jwt;

    if (token == null) {
        return res.status(401).json({
            success: false,
            status: 401,
            error: {
                name: "authentication",
                message: "Unauthorized",
                status: 401
            }
        });
    }

    try {
        const decoded = await verifyToken(token);
        // Tìm người dùng trong cơ sở dữ liệu
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                status: 401,
                error: {
                    name: "authentication",
                    message: "Unauthorized: User not found",
                    status: 401
                }
            });
        }

        // Gán thông tin người dùng vào req.user
        req.user = user;
        next();
    } catch (err) {
        res.status(403).json({
            success: false,
            status: 403,
            error: {
                name: "authentication",
                message: "Forbidden",
                status: 403,
                details: err.message
            }
        });
    }
}

module.exports = authenticateToken;

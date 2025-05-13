const { verifyToken } = require('../../utils/jwt');
const User = require('../models/User');  // Đảm bảo đã import model User đúng cách

async function requireAdmin(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({
            success: false,
            status: 401,
            error: {
                name: "authentication",
                message: "No token provided",
                status: 401,
                details: "Authorization token is missing or invalid"
            }
        });
    }

    try {
        const decoded = await verifyToken(token);
        const user = await User.findByPk(decoded.id);

        if (user && user.role === 'Admin') {
            req.user = user;
            next();
        } else {
            res.status(403).json({
                success: false,
                status: 403,
                error: {
                    name: "authorization",
                    message: "Forbidden access",
                    status: 403,
                    details: "User does not have admin privileges"
                }
            });
        }
    } catch (err) {
        res.status(403).json({
            success: false,
            status: 403,
            error: {
                name: "authentication",
                message: "Forbidden",
                status: 403
            }
        });
    }
}

async function requireStaff(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({
            success: false,
            status: 401,
            error: {
                name: "authentication",
                message: "No token provided",
                status: 401,
            }
        });
    }

    try {
        const decoded = await verifyToken(token);
        const user = await User.findByPk(decoded.id);

        if (user && (user.role === 'Staff' || user.role === 'Admin')) {
            req.user = user;
            next();
        } else {
            res.status(403).json({
                success: false,
                status: 403,
                error: {
                    name: "authorization",
                    message: "Forbidden access",
                    status: 403,
                }
            });
        }
    } catch (err) {
        res.status(403).json({
            success: false,
            status: 403,
            error: {
                name: "authentication",
                message: "Forbidden",
                status: 403
            }
        });
    }
}

// Export các hàm dùng CommonJS
module.exports = {
    requireAdmin,
    requireStaff
};

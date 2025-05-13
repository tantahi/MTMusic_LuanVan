const path = require('path');
const express = require('express');
const logger = require('morgan');
const cors = require("cors");
const session = require('express-session');
const passport = require('passport');
const User = require('./app/models/User');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { generateToken } = require('./utils/jwt');
const bcrypt = require('bcrypt');
const http = require('http'); // Thêm http server để sử dụng với socket.io
const socketIo = require('socket.io'); // Thêm socket.io

const db = require('./config/db');
const route = require('./routes');
const ApiError = require("./app/api-error");

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Tạo HTTP server từ Express app để kết nối với socket.io
const server = http.createServer(app);

// Thiết lập socket.io trên server
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000", // Địa chỉ frontend được phép truy cập
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Lưu socket.io vào app để dùng trong các controller
app.set('io', io);

// Thiết lập CORS
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "PUT", "POST", "DELETE"],
    credentials: true,
}));

// Thiết lập middleware session
app.use(session({ 
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));

// Thiết lập middleware cho Passport
app.use(passport.initialize());
app.use(passport.session());

// Cấu hình Google OAuth
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3001/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
        const { id, displayName, emails } = profile;
        const hashedPassword = await bcrypt.hash("12345678", 10)
        let user = await User.findOne({ where: { email: emails[0].value } });

        if (!user) {
          user = await User.create({
            email: emails[0].value,
            full_name: displayName,
            role: 'User',
            status: 'Active',
            password: hashedPassword,
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
        done(null, user);
    } catch (err) {
        done(err, null);
    }
  }
));

// Cấu hình serialize/deserialize người dùng
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Định tuyến đăng nhập Google
app.get('/auth/google', (req, res, next) => {
    if (req.isAuthenticated()) {
        req.logout((err) => {
            if (err) {
                return next(err);
            }
            next();
        });
    } else {
        next();
    }
}, passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }));

// Định tuyến callback Google
app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('http://localhost:3000/auth/callback');
    }
);

app.get('/auth/user/google', (req, res) => {
    if (req.isAuthenticated()) {
        const token = generateToken(req.user);
        res.status(200).json({
            success: true,
            status: 200,
            message: 'User authenticated successfully',
            token,
            user: req.user
        });
    } else {
        res.status(401).json({
            success: false,
            status: 401,
            error: {
                name: "authentication",
                message: 'User not authenticated',
                status: 401
            }
        });
    }
});

// Các middleware cơ bản
app.use(logger("tiny"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

// Kết nối cơ sở dữ liệu
db.connect();

// Khởi tạo các routes của ứng dụng
route(app);

// Xử lý lỗi 404
app.use((req, res, next) => {
    return next(new ApiError(404, "Resource not found"));
});

// Lắng nghe sự kiện kết nối của client thông qua socket.io
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Lắng nghe sự kiện khi client gửi tin nhắn
    socket.on('sendMessage', (message) => {
        console.log('Message received:', message);
        // Phát lại tin nhắn cho tất cả các client khác
        io.emit('receiveMessage', message);
    });

    // Lắng nghe sự kiện khi người dùng ngắt kết nối
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Khởi động server
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

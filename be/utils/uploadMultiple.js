const path = require('path');
const multer = require('multer');

// Cấu hình lưu trữ
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads'); // Đường dẫn lưu file
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Tạo tên file duy nhất
  },
});

// Cấu hình multer để nhận nhiều file
const upload = multer({ storage: storage });

const uploadMultiple = upload.fields([
  { name: 'img_url', maxCount: 1 },   // Trường img_url, chỉ nhận 1 file
  { name: 'audio_url', maxCount: 1 }, // Trường audio_url, chỉ nhận 1 file
]);

module.exports = uploadMultiple;

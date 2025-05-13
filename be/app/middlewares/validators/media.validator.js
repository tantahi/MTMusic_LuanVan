const multer = require('multer');
const { body } = require('express-validator');
const User = require('../../models/User');

// Cấu hình Multer
const upload = multer({
  // Các tùy chọn như lưu file vào đâu hoặc cấu hình bộ nhớ
});

// Validation cho form data
const mediaValidation = [
//   // Kiểm tra name (bắt buộc phải có và không được trống)
//   body('name')
//     .notEmpty().withMessage('Name is required'),

//   // Kiểm tra artist_name (bắt buộc phải có và không được trống)
//   body('artist_name')
//     .notEmpty().withMessage('Artist name is required'),

//   // Không kiểm tra img_url trực tiếp vì đây là file được upload qua Multer
//   // Kiểm tra description (có thể tùy chọn nhưng không được quá dài)
//   body('description')
//     .optional()
//     .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

//   // Kiểm tra media_type (bắt buộc và chỉ có thể là 'Song' hoặc 'Podcast')
//   body('media_type')
//     .isIn(['Song', 'Podcast']).withMessage('Media type must be either Song or Podcast'),

//   // Kiểm tra genre (chỉ có thể là 'Pop', 'Rap', 'Jazz', 'Classical')
//   body('genre')
//     .optional()
//     .isIn(['Pop', 'Rap', 'Jazz', 'Classical']).withMessage('Genre must be one of the following: Pop, Rap, Jazz, Classical'),

//   // Kiểm tra likes_count (phải là số nguyên không âm)
//   body('likes_count')
//     .optional()
//     .isInt({ min: 0 }).withMessage('Likes count must be a non-negative integer'),

//   // Kiểm tra comments_count (phải là số nguyên không âm)
//   body('comments_count')
//     .optional()
//     .isInt({ min: 0 }).withMessage('Comments count must be a non-negative integer'),

//   // Kiểm tra reports_count (phải là số nguyên không âm)
//   body('reports_count')
//     .optional()
//     .isInt({ min: 0 }).withMessage('Reports count must be a non-negative integer'),
];

module.exports = {
  mediaValidation
};

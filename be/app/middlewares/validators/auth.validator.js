const { body } = require('express-validator');
const User = require('../../models/User');
const { param } = require('express-validator');
const registerValidation = [
  // Kiểm tra email
  body('email')
    .isEmail().withMessage('Please enter a valid email address')
    .custom(async (value) => {
      const existingUser = await User.findOne({ where: { email: value } });
      if (existingUser) {
        throw new Error('Email already in use');
      }
      return true;
    }),

  // Kiểm tra password
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),

  // Kiểm tra full_name
  body('full_name')
    .notEmpty().withMessage('Full name is required'),

  // Kiểm tra role (nếu được cung cấp)
  body('role')
    .optional()
    .isIn(['Admin', 'Staff', 'User', 'Vip User']).withMessage('Invalid role'),

  // Kiểm tra status (nếu được cung cấp)
  body('status')
    .optional()
    .isIn(['Active', 'Inactive', 'Banned']).withMessage('Invalid status'),

  // Kiểm tra birthday (nếu được cung cấp)
  body('birthday')
    .optional()
    .isDate().withMessage('Please enter a valid date for birthday'),

  // Kiểm tra address (nếu được cung cấp)
  body('address')
    .optional()
    .isString().withMessage('Address must be a valid string')
];

const loginValidation = [
  // Kiểm tra email
  body('email')
    .isEmail().withMessage('Please enter a valid email address'),

  // Kiểm tra password
  body('password')
    .notEmpty().withMessage('Password is required')
];

const createUserValidation = [
    // Kiểm tra email
    body('email')
      .isEmail().withMessage('Please enter a valid email address')
      .custom(async (value) => {
        const existingUser = await User.findOne({ where: { email: value } });
        if (existingUser) {
          throw new Error('Email already in use');
        }
        return true;
      }),
  
    // Kiểm tra password
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  
    // Kiểm tra full_name
    body('full_name')
      .notEmpty().withMessage('Full name is required'),
  
    // Kiểm tra role (nếu được cung cấp)
    body('role')
      .optional()
      .isIn(['Admin', 'Staff', 'User', 'Vip User']).withMessage('Invalid role'),
  
    // Kiểm tra status (nếu được cung cấp)
    body('status')
      .optional()
      .isIn(['Active', 'Inactive', 'Banned']).withMessage('Invalid status'),
  
    // Kiểm tra birthday (nếu được cung cấp)
    body('birthday')
      .optional()
      .isDate().withMessage('Please enter a valid date for birthday'),
  
    // Kiểm tra address (nếu được cung cấp)
    body('address')
      .optional()
      .isString().withMessage('Address must be a valid string')
  ];
  const updateUserValidation = [
    // Kiểm tra email (nếu được cập nhật)
    body('email')
      .optional()
      .isEmail().withMessage('Please enter a valid email address'),
  
    // Kiểm tra password (nếu được cập nhật)
    body('password')
      .optional()
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  
    // Kiểm tra full_name (nếu được cập nhật)
    body('full_name')
      .optional()
      .notEmpty().withMessage('Full name is required'),
  
    // Kiểm tra role (nếu được cập nhật)
    body('role')
      .optional()
      .isIn(['Admin', 'Staff', 'User', 'Vip User']).withMessage('Invalid role'),
  
    // Kiểm tra status (nếu được cập nhật)
    body('status')
      .optional()
      .isIn(['Active', 'Inactive', 'Banned']).withMessage('Invalid status'),
  
    // Kiểm tra birthday (nếu được cập nhật)
    body('birthday')
      .optional()
      .isDate().withMessage('Please enter a valid date for birthday'),
  
    // Kiểm tra address (nếu được cập nhật)
    body('address')
      .optional()
      .isString().withMessage('Address must be a valid string')
  ];
  const deleteUserValidation = [
    // Kiểm tra ID người dùng có phải là số không
    body('id')
      .isInt().withMessage('User ID must be a valid number')
  ];

  const getUserValidation = [
    param('id')
        .isInt().withMessage('User ID must be an integer') // Kiểm tra ID có phải là số nguyên không
];
  
  

module.exports = {
  registerValidation,
  loginValidation,
  updateUserValidation,
  createUserValidation,
  deleteUserValidation,
  getUserValidation,

};

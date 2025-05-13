const express = require('express');
const router = express.Router();
const AuthController = require('../app/controllers/auth.controller');
const { requireAdmin } = require('../app/middlewares/role.middleware');
const {
  createUserValidation,
  updateUserValidation,
  deleteUserValidation,
  getUserValidation,
} = require('../app/middlewares/validators/auth.validator');
const { validationResult } = require('express-validator');

// Helper function to handle validation errors
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      status: 422,
      error: {
        name: 'validation_error',
        message: 'Validation failed',
        status: 422,
        details: errors.array(),
      },
    });
  }
};

// [GET] Lấy danh sách người dùng
router.get('/users', requireAdmin, async (req, res) => {
  try {
    await AuthController.getAllUsers(req, res);
  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({
      success: false,
      status: 500,
      error: {
        name: 'server_error',
        message: 'Something went wrong',
        status: 500,
      },
    });
  }
});

// [POST] Tạo người dùng mới
router.post('/users', requireAdmin, createUserValidation, (req, res) => {
  if (handleValidationErrors(req, res)) return;

  AuthController.createUser(req, res).catch((error) => {
    console.error('Create User Error:', error);
    res.status(500).json({
      success: false,
      status: 500,
      error: {
        name: 'server_error',
        message: 'Failed to create user',
        status: 500,
      },
    });
  });
});

// [PUT] Cập nhật người dùng
router.put('/users/:id', requireAdmin, updateUserValidation, (req, res) => {
  if (handleValidationErrors(req, res)) return;

  AuthController.updateUser(req, res).catch((error) => {
    console.error('Update User Error:', error);
    res.status(500).json({
      success: false,
      status: 500,
      error: {
        name: 'server_error',
        message: 'Failed to update user',
        status: 500,
      },
    });
  });
});

// // [DELETE] Xóa người dùng
// router.delete('/users/:id', requireAdmin, deleteUserValidation, (req, res) => {
//   if (handleValidationErrors(req, res)) return;

//   AuthController.deleteUser(req, res).catch((error) => {
//     console.error('Delete User Error:', error);
//     res.status(500).json({
//       success: false,
//       status: 500,
//       error: {
//         name: 'server_error',
//         message: 'Failed to delete user',
//         status: 500,
//     },
//     });
//     });
// });
// [GET] Lấy thông tin một người dùng
router.get('/users/:id', getUserValidation, (req, res) => {
    if (handleValidationErrors(req, res)) return;
  
    AuthController.getUserById(req, res).catch((error) => {
      console.error('Get User By ID Error:', error);
      res.status(500).json({
        success: false,
        status: 500,
        error: {
          name: 'server_error',
          message: 'Failed to fetch user',
          status: 500,
        },
      });
    });
  });
  
  // [GET] /users - Lấy danh sách tất cả người dùng
router.get('/users', requireAdmin, (req, res) => {
    AuthController.getAllUsers(req, res);
});


// [POST] /users - Tạo người dùng mới
router.post('/users', requireAdmin, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            status: 400,
            error: {
                name: "validation",
                message: "Validation failed",
                status: 400,
                details: errors.array(),
            },
        });
    }
    AuthController.createUser(req, res);
});

// [PUT] /users/:id - Cập nhật thông tin người dùng
router.put('/users/:id', requireAdmin, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            status: 400,
            error: {
                name: "validation",
                message: "Validation failed",
                status: 400,
                details: errors.array(),
            },
        });
    }
    AuthController.updateUser(req, res);
});

// [DELETE] /users/:id - Xóa người dùng
router.delete('/users/:id', requireAdmin, (req, res) => {
    AuthController.deleteUser(req, res);
});

// [PATCH] /users/:id/role - Cập nhật vai trò của người dùng
router.patch('/users/:id/role', requireAdmin, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            status: 400,
            error: {
                name: "validation",
                message: "Validation failed",
                status: 400,
                details: errors.array(),
            },
        });
    }
    AuthController.updateUserRole(req, res);
});
  module.exports = router;
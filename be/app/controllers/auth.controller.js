const bcrypt = require('bcrypt');
const User = require('../models/User');
const { generateToken } = require('../../utils/jwt');
const uploadOne = require('../../utils/uploadOne');
const deleteUpload = require('../../utils/deleteUpload');
const { Op } = require('sequelize');

class AuthController {
    // [POST] /auth/register
    static async register(req, res) {
        const { email, password, full_name, role, birthday, address, status } = req.body;

        try {
            // Mã hóa mật khẩu
            const hashedPassword = await bcrypt.hash(password, 10);

            // Tạo người dùng mới
            const user = await User.create({
                email,
                password: hashedPassword,
                full_name,
                birthday: birthday || null,
                address: address || null,
                role: role || 'User',
                status: status || 'Active',
                created_at: new Date(),
                updated_at: new Date(),
            });

            // Trả về thông tin người dùng mà không bao gồm mật khẩu
            res.status(201).json({
                success: true,
                status: 201,
                message: 'User registered successfully',
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    birthday: user.birthday,
                    address: user.address,
                    status: user.status
                }
            });
        } catch (error) {
            console.error('Registration Error:', error);
            res.status(500).json({
                success: false,
                status: 500,
                error: {
                    name: "registration",
                    message: 'Registration failed',
                    status: 500,
                    details: error.message
                }
            });
        }
    }

// [POST] /auth/login 
static async login(req, res) {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ 
            where: { 
              email,
              status: {
                [Op.ne]: 'Banned'
              }
            } 
          });
        if (!user) {
            return res.status(400).json({
                success: false,
                status: 400,
                error: {
                    name: "authentication",
                    message: 'Invalid email or password',
                    status: 400
                }
            });
        }

        // Check password validity
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                status: 400,
                error: {
                    name: "authentication",
                    message: 'Invalid email or password',
                    status: 400
                }
            });
        }

        // Create JWT token
        const token = generateToken(user);

        // Optionally, you may want to omit the password from the user object
        const { password: _, ...userDetails } = user.get({ plain: true }); // Assuming Sequelize is used

        // Respond with token and user information
        res.status(200).json({
            success: true,
            status: 200,
            message: 'Login successful',
            token,
            user: userDetails // Send full user details, excluding the password
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({
            success: false,
            status: 500,
            error: {
                name: "authentication",
                message: 'Login failed',
                status: 500,
                details: error.message
            }
        });
    }
}

    // [PATCH] /auth/user/:id/vip
    static async updateVip(req, res) {
        const { id } = req.params;

        try {
            // Tìm người dùng theo id
            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    status: 404,
                    error: {
                        name: "not_found",
                        message: 'User not found',
                        status: 404
                    }
                });
            }

            // Cập nhật trạng thái VIP cho người dùng
            const currentDate = new Date();
            const vipEndDate = new Date(currentDate);
            vipEndDate.setMonth(vipEndDate.getMonth() + 3); // Thêm 3 tháng vào ngày hiện tại

            user.role = 'Vip User';
            user.vip_start_date = currentDate;
            user.vip_end_date = vipEndDate;
            user.updated_at = currentDate;
            await user.save();

            res.status(200).json({
                success: true,
                status: 200,
                message: 'User VIP status updated successfully',
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    vip_start_date: user.vip_start_date,
                    vip_end_date: user.vip_end_date,
                    status: user.status
                }
            });
        } catch (error) {
            console.error('Update VIP Error:', error);
            res.status(500).json({
                success: false,
                status: 500,
                error: {
                    name: "update_vip",
                    message: 'Failed to update VIP status',
                    status: 500,
                    details: error.message
                }
            });
        }
    }
    
    // [GET] /auth/me
    static async getMe(req, res) {
        try {
            // Lấy thông tin người dùng từ middleware authenticateToken
            const user = req.user;
            if (!user) {
                return res.status(404).json({
                    success: false,
                    status: 404,
                    error: {
                        name: "not_found",
                        message: 'User not found',
                        status: 404
                    }
                });
            }

            // Trả về thông tin người dùng mà không bao gồm mật khẩu
            res.status(200).json({
                success: true,
                status: 200,
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    img_url: user.img_url,
                    birthday: user.birthday,
                    address: user.address,
                    status: user.status,
                    paypalAccountId: user.paypalAccountId,
                    paypalEmail: user.paypalEmail,
                    vip_start_date: user.vip_start_date,
                    vip_end_date: user.vip_end_date
                }
            });
        } catch (error) {
            console.error('Get Me Error:', error);
            res.status(500).json({
                success: false,
                status: 500,
                error: {
                    name: "get_me",
                    message: 'Failed to retrieve user information',
                    status: 500,
                    details: error.message
                }
            });
        }
    }

        // [PATCH] /auth/user/:id/password - Đổi mật khẩu
        static async changePassword(req, res) {
            const { id } = req.params;
            const { current_password, new_password } = req.body;
    
            try {
                // Tìm người dùng theo id
                const user = await User.findByPk(id);
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        status: 404,
                        error: {
                            name: "not_found",
                            message: 'User not found',
                            status: 404
                        }
                    });
                }
    
                // Kiểm tra mật khẩu cũ
                const isPasswordValid = await bcrypt.compare(current_password, user.password);
                if (!isPasswordValid) {
                    return res.status(400).json({
                        success: false,
                        status: 400,
                        error: {
                            name: "authentication",
                            message: 'Invalid old password',
                            status: 400
                        }
                    });
                }
    
                // Mã hóa mật khẩu mới và cập nhật
                const hashedNewPassword = await bcrypt.hash(new_password, 10);
                user.password = hashedNewPassword;
                user.updated_at = new Date();
                await user.save();
    
                res.status(200).json({
                    success: true,
                    status: 200,
                    message: 'Password changed successfully'
                });
            } catch (error) {
                console.error('Change Password Error:', error);
                res.status(500).json({
                    success: false,
                    status: 500,
                    error: {
                        name: "change_password",
                        message: 'Failed to change password',
                        status: 500,
                        details: error.message
                    }
                });
            }
        }
    
        // [PUT] /auth/user/:id - Cập nhật thông tin người dùng
        static async updateUserInfo(req, res) {
            const { id } = req.params;
            const { full_name, birthday, address } = req.body;
    
            try {
                // Tìm người dùng theo id
                const user = await User.findByPk(id);
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        status: 404,
                        error: {
                            name: "not_found",
                            message: 'User not found',
                            status: 404
                        }
                    });
                }
    
                // Cập nhật thông tin người dùng
                user.full_name = full_name || user.full_name;
                user.birthday = birthday || user.birthday;
                user.address = address || user.address;
                user.updated_at = new Date();
                await user.save();
    
                res.status(200).json({
                    success: true,
                    status: 200,
                    message: 'User information updated successfully',
                    user: {
                        id: user.id,
                        email: user.email,
                        full_name: user.full_name,
                        birthday: user.birthday,
                        address: user.address,
                        role: user.role,
                        status: user.status,
                        vip_start_date: user.vip_start_date,
                        vip_end_date: user.vip_end_date
                    }
                });
            } catch (error) {
                console.error('Update User Info Error:', error);
                res.status(500).json({
                    success: false,
                    status: 500,
                    error: {
                        name: "update_info",
                        message: 'Failed to update user information',
                        status: 500,
                        details: error.message
                    }
                });
            }
        }
    
        // [GET] /auth/user/:id/vip-status - Lấy thông tin trạng thái VIP của người dùng
        static async getVipStatus(req, res) {
            const { id } = req.params;
    
            try {
                // Tìm người dùng theo id
                const user = await User.findByPk(id);
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        status: 404,
                        error: {
                            name: "not_found",
                            message: 'User not found',
                            status: 404
                        }
                    });
                }
    
                res.status(200).json({
                    success: true,
                    status: 200,
                    vip_status: {
                        id: user.id,
                        role: user.role,
                        vip_start_date: user.vip_start_date,
                        vip_end_date: user.vip_end_date,
                        is_vip: user.role === 'Vip User' && new Date() < new Date(user.vip_end_date)
                    }
                });
            } catch (error) {
                console.error('Get VIP Status Error:', error);
                res.status(500).json({
                    success: false,
                    status: 500,
                    error: {
                        name: "get_vip_status",
                        message: 'Failed to retrieve VIP status',
                        status: 500,
                        details: error.message
                    }
                });
            }
        }





    // [GET] /admin/users
    static async getAllUsers(req, res) {
        try {
            // Lấy danh sách tất cả người dùng
            const users = await User.findAll();

            res.status(200).json({
                success: true,
                status: 200,
                data: users.map(user => ({
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    birthday: user.birthday,
                    address: user.address,
                    status: user.status,
                    vip_start_date: user.vip_start_date,
                    vip_end_date: user.vip_end_date
                }))
            });
        } catch (error) {
            console.error('Get Users Error:', error);
            res.status(500).json({
                success: false,
                status: 500,
                error: {
                    name: "retrieval",
                    message: 'Failed to retrieve users',
                    status: 500,
                }
            });
        }
    }
        // [POST] /admin/users
        static async createUser(req, res) {
            try {
                const { email, password, full_name, role, birthday, address, status } = req.body;
                
                // Tạo người dùng mới
                const newUser = await User.create({
                    email,
                    password, // Lưu ý: Nên hash password trước khi lưu
                    full_name,
                    role,
                    birthday,
                    address,
                    status
                });
    
                res.status(201).json({
                    success: true,
                    status: 201,
                    message: 'User created successfully',
                    data: {
                        id: newUser.id,
                        email: newUser.email,
                        full_name: newUser.full_name,
                        role: newUser.role,
                        birthday: newUser.birthday,
                        address: newUser.address,
                        status: newUser.status
                    }
                });
            } catch (error) {
                console.error('Create User Error:', error);
                res.status(500).json({
                    success: false,
                    status: 500,
                    error: {
                        name: "creation",
                        message: 'Failed to create user',
                        status: 500,
                    }
                });
            }
        }
    
        // [PUT] /admin/users/:id
        static async updateUser(req, res) {
            try {
                const { id } = req.params;
                const { email, full_name, role, birthday, address, status } = req.body;
    
                // Tìm người dùng theo id
                const user = await User.findByPk(id);
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        status: 404,
                        error: {
                            name: "not_found",
                            message: 'User not found',
                            status: 404,
                        }
                    });
                }
    
                // Cập nhật thông tin người dùng
                await user.update({
                    email,
                    full_name,
                    role,
                    birthday,
                    address,
                    status
                });
    
                res.status(200).json({
                    success: true,
                    status: 200,
                    message: 'User updated successfully',
                    data: {
                        id: user.id,
                        email: user.email,
                        full_name: user.full_name,
                        role: user.role,
                        birthday: user.birthday,
                        address: user.address,
                        status: user.status
                    }
                });
            } catch (error) {
                console.error('Update User Error:', error);
                res.status(500).json({
                    success: false,
                    status: 500,
                    error: {
                        name: "update",
                        message: 'Failed to update user',
                        status: 500,
                    }
                });
            }
        }
    
        // [DELETE] /admin/users/:id
        static async deleteUser(req, res) {
            try {
                const { id } = req.params;
    
                // Tìm người dùng theo id
                const user = await User.findByPk(id);
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        status: 404,
                        error: {
                            name: "not_found",
                            message: 'User not found',
                            status: 404,
                        }
                    });
                }
    
                // Xóa người dùng
                await user.destroy();
    
                res.status(200).json({
                    success: true,
                    status: 200,
                    message: 'User deleted successfully'
                });
            } catch (error) {
                console.error('Delete User Error:', error);
                res.status(500).json({
                    success: false,
                    status: 500,
                    error: {
                        name: "deletion",
                        message: 'Failed to delete user',
                        status: 500,
                    }
                });
            }
        }
        // [GET] /admin/users/:id
    static async getUserById(req, res) {
        try {
            const { id } = req.params;

            // Tìm người dùng theo ID
            const user = await User.findByPk(id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    status: 404,
                    error: {
                        name: "not_found",
                        message: 'User not found',
                        status: 404,
                    }
                });
            }

            res.status(200).json({
                success: true,
                status: 200,
                data: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    birthday: user.birthday,
                    address: user.address,
                    status: user.status,
                    vip_start_date: user.vip_start_date,
                    vip_end_date: user.vip_end_date,
                    report_count: user.report_count
                }
            });
        } catch (error) {
            console.error('Get User by ID Error:', error);
            res.status(500).json({
                success: false,
                status: 500,
                error: {
                    name: "retrieval",
                    message: 'Failed to retrieve user',
                    status: 500,
                }
            });
        }
    }
    // [PATCH] /admin/users/:id/role
    static async updateUserRole(req, res) {
        const { id } = req.params;  // Lấy ID người dùng từ URL
        const { role } = req.body;  // Lấy vai trò mới từ request body

        try {
            // Tìm người dùng theo id
            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    status: 404,
                    error: {
                        name: "not_found",
                        message: 'User not found',
                        status: 404
                    }
                });
            }

            // Kiểm tra vai trò mới có hợp lệ không
            const validRoles = ['Admin', 'Staff', 'User', 'Vip User'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({
                    success: false,
                    status: 400,
                    error: {
                        name: "invalid_role",
                        message: `Invalid role. Allowed roles are: ${validRoles.join(', ')}`,
                        status: 400
                    }
                });
            }

            // Cập nhật vai trò cho người dùng
            user.role = role;
            user.updated_at = new Date();  // Cập nhật thời gian sửa đổi
            await user.save();

            // Trả về thông tin người dùng sau khi cập nhật
            res.status(200).json({
                success: true,
                status: 200,
                message: 'User role updated successfully',
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    birthday: user.birthday,
                    address: user.address,
                    status: user.status
                }
            });
        } catch (error) {
            console.error('Update Role Error:', error);
            res.status(500).json({
                success: false,
                status: 500,
                error: {
                    name: "update_role",
                    message: 'Failed to update user role',
                    status: 500,
                    details: error.message
                }
            });
        }
    }

    static async updateAvatar(req, res) {
        const user  = req.user; // Lấy ID người dùng từ request body
        const userId = user.id;
    
        try {
            // Upload image
            await new Promise((resolve, reject) => {
                uploadOne(req, res, (err) => {
                    if (err) {
                        return reject({ success: false, message: 'Error uploading files', err });
                    }
                    resolve();
                });
            });
    
            const img_url = req.file ? `/uploads/${req.file.filename}` : null;
            if (!img_url) {
                return res.status(400).json({
                    success: false,
                    status: 400,
                    message: 'No image file provided',
                });
            }
    
            // Tìm người dùng theo ID và cập nhật ảnh đại diện
            const userToUpdate = await User.findByPk(userId);
            if (!userToUpdate) {
                return res.status(404).json({
                    success: false,
                    status: 404,
                    message: 'User not found',
                });
            }
    
            // Xóa ảnh cũ nếu có
            if (userToUpdate.img_url) {
                deleteUpload(`public${userToUpdate.img_url}`);
            }
    
            // Cập nhật đường dẫn ảnh đại diện mới
            userToUpdate.img_url = img_url; 
            await userToUpdate.save(); // Lưu người dùng sau khi cập nhật
    
            res.status(200).json({
                success: true,
                status: 200,
                message: 'Avatar updated successfully',
                img_url: userToUpdate.img_url, // Trả về URL ảnh đại diện mới
            });
        } catch (error) {
            console.error('Update Avatar Error:', error);
            res.status(500).json({
                success: false,
                status: 500,
                message: 'Failed to update avatar',
                error: error.message,
            });
        }
    }

    static async updatePaymentInfo(req, res) {
        try {
          const userId = req.user.id; // Assuming you have middleware that sets req.user
          const { paypalAccountId, paypalEmail } = req.body;
      
          // Validate input
          if (!paypalAccountId && !paypalEmail) {
            return res.status(400).json({
              status: 'error',
              message: 'Either PayPal Account ID or PayPal Email is required',
              data: null
            });
          }
      
          // Validate email format if provided
          if (paypalEmail) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(paypalEmail)) {
              return res.status(400).json({
                status: 'error',
                message: 'Invalid email format',
                data: null
              });
            }
          }
      
          // Prepare update object
          const updateData = {};
          if (paypalAccountId) updateData.paypalAccountId = paypalAccountId;
          if (paypalEmail) updateData.paypalEmail = paypalEmail;
      
          // Update user's payment information
          const [updatedCount, updatedUsers] = await User.update(
            updateData,
            { where: { id: userId }, returning: true }
          );
      
          if (updatedCount === 0) {
            return res.status(404).json({
              status: 'error',
              message: 'User not found',
              data: null
            });
          }
      
          const updatedUser = updatedUsers[0];
      
          res.status(200).json({
            status: 'success',
            message: 'Payment information updated successfully',
            data: {
              id: updatedUser.id,
              email: updatedUser.email,
              paypalAccountId: updatedUser.paypalAccountId,
              paypalEmail: updatedUser.paypalEmail
            }
          });
        } catch (error) {
          console.error('Error updating payment information:', error);
          res.status(500).json({
            status: 'error',
            message: 'An error occurred while updating payment information',
            data: null
          });
        }
      }

}


module.exports = AuthController;

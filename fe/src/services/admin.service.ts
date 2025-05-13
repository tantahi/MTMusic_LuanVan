import createApiClient from '@services/api.service';
import {
  UserType,
  //   CreateUserRequest,
  //   UpdateUserRequest,
  //   UpdateUserRoleRequest
} from '@/types';
import { API } from '@configs/auth.config';

const apiClient = createApiClient();

class AdminService {
  // Lấy tất cả người dùng
  async getAllUsers(token: string): Promise<UserType[]> {
    try {
      const response = await apiClient.get(API.ADMIN.USERS.GET_ALL, token);
      return response.data;
    } catch (error) {
      return Promise.reject(error); // Trả về reject nếu có lỗi
    }
  }

  // Lấy thông tin một người dùng theo ID
  async getUserById(id: number, token: string): Promise<UserType> {
    try {
      const response = await apiClient.get(API.ADMIN.USERS.GET_BY_ID(id), token);
      return response.data;
    } catch (error) {
      return Promise.reject(error); // Trả về reject nếu có lỗi
    }
  }

  // Tạo người dùng mới
  async createUser(request: UserType, token: string): Promise<UserType> {
    try {
      const response = await apiClient.post(API.ADMIN.USERS.CREATE, request, token);
      return response.data;
    } catch (error) {
      return Promise.reject(error); // Trả về reject nếu có lỗi
    }
  }

  // Cập nhật thông tin người dùng
  async updateUser(id: number, request: UserType, token: string): Promise<UserType> {
    try {
      const response = await apiClient.put(API.ADMIN.USERS.UPDATE(id), request, token);
      return response.data;
    } catch (error) {
      return Promise.reject(error); // Trả về reject nếu có lỗi
    }
  }

  // Xóa người dùng
  async deleteUser(id: number, token: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete(API.ADMIN.USERS.DELETE(id), token);
      return response.data;
    } catch (error) {
      return Promise.reject(error); // Trả về reject nếu có lỗi
    }
  }

  // Cập nhật vai trò người dùng
  async updateUserRole(id: number, role: string, token: string): Promise<UserType> {
    try {
      const response = await apiClient.put(API.ADMIN.USERS.UPDATE_ROLE(id), { role }, token);
      return response.data;
    } catch (error) {
      return Promise.reject(error); // Trả về reject nếu có lỗi
    }
  }
}

const adminService = new AdminService();
export default adminService;

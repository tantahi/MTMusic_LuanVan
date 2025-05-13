import createApiClient from '@services/api.service';
import { createMultipartApiClient } from '@services/api.service';
const apiClient = createApiClient();
const multipartApiClient = createMultipartApiClient();
import { LoginRequest, RegisterRequest, PaymentRequest, ChangePasswordRequest, UpdateUserInfoRequest, UserType } from '@/types';
import { API } from '@configs/auth.config';

class AuthService {
  async Register(request: RegisterRequest): Promise<any> {
    try {
      const data = await apiClient.post(API.AUTH.REGISTER, request);
      return Promise.resolve(data);
    } catch (error) {
      return Promise.reject(error);
    }
  }
  async Login(request: LoginRequest): Promise<any> {
    try {
      const data = await apiClient.post(API.AUTH.LOGIN, request);
      return Promise.resolve(data);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async ChangeAvatar(request: any, token: string): Promise<any> {
    try {
        const data = await multipartApiClient.post(API.AUTH.CHANGE_AVATAR, request, token);
        return Promise.resolve(data);
    } catch (error) {
        return Promise.reject(error);
    }
}
  

  async fetchGoogleUser(): Promise<any> {
    try {
      const data = await apiClient.get(API.AUTH.FETCH_GOOGLE_USER);
      return Promise.resolve(data);
    } catch (error) {
      console.error('Fetch Google User Error:', error);
      return Promise.reject(new Error('Failed to fetch user'));
    }
  }

  // Thanh toán
  async Payment(request: PaymentRequest, token: string): Promise<any> {
    try {
      const data = await apiClient.post(API.AUTH.PAYMENT, request, token);
      return Promise.resolve(data);
    } catch (error) {
      console.error('Payment error:', error);
      return Promise.reject(error); // Trả về reject nếu có lỗi
    }
  }

    // Đổi mật khẩu người dùng
    async changePassword(userId: number, request: ChangePasswordRequest, token: string): Promise<any> {
        try {
          const data = await apiClient.put(API.AUTH.CHANGE_PASSWORD(userId), request, token);
          console.log("abccccccccccccccccccccccccccccccccccccccccc", data)
          return Promise.resolve(data);
        } catch (error) {
          console.error('Change Password Error:', error);
          return Promise.reject(new Error('Failed to change password'));
        }
      }
    
      // Cập nhật thông tin người dùng
      async updateUserInfo(userId: number, request: UpdateUserInfoRequest, token: string): Promise<any> {
        try {
          const data = await apiClient.put(API.AUTH.UPDATE_USER_INFO(userId), request, token);
          return Promise.resolve(data);
        } catch (error) {
          console.error('Update User Info Error:', error);
          return Promise.reject(new Error('Failed to update user information'));
        }
      }

      async getMe (token?: string): Promise<UserType> {
        try {
            const data = await apiClient.get(API.PROFILE.GET_ME, token)
            return Promise.resolve(data);
        } catch (error) {
            console.error('Get User Info Error:', error);
            return Promise.reject(new Error('Failed to get user information'));
        }
      }
}


const authservice = new AuthService();
export default authservice;

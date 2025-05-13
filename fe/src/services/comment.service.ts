import createApiClient from '@services/api.service';
import { API } from '@configs/auth.config';

const apiClient = createApiClient();

class CommentService {
    // Tạo bình luận mới
    async createComment(request: any, token: string): Promise<any> {
        try {
            const response = await apiClient.post(API.COMMENTS.CREATE, request, token);
            return response;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    // Lấy thông tin một bình luận theo ID
    async getCommentById(id: number): Promise<any> {
        try {
            const response = await apiClient.get(API.COMMENTS.GET_BY_ID(id));
            return response;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    // Xóa bình luận theo ID
    async deleteComment(id: number, token: string): Promise<{ message: string }> {
        try {
            const response = await apiClient.delete(API.COMMENTS.DELETE(id), token);
            return response;
        } catch (error) {
            return Promise.reject(error);
        }
    }
}

const commentService = new CommentService();
export default commentService;

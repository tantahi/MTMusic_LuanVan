import createApiClient from '@services/api.service';
import { createMultipartApiClient } from '@services/api.service';
import { MediaType } from '@/types';
import { API } from '@configs/auth.config';

const apiClient = createApiClient();
const multipartApiClient = createMultipartApiClient();

class MediaService {
    // Tạo mới một media
    async createMedia(request: MediaType, token: string): Promise<MediaType> {
        try {
            const response = await multipartApiClient.post(API.MEDIA.CREATE, request, token);
            console.log(response)
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    // Cập nhật một media theo ID
    async updateMedia(id: number, request: MediaType, token: string): Promise<MediaType> {
        try {
            const response = await multipartApiClient.put(API.MEDIA.UPDATE(id), request, token);
            return response;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    // Xóa một media theo ID
    async deleteMedia(id: number, token: string): Promise<{ message: string }> {
        try {
            const response = await apiClient.delete(API.MEDIA.DELETE(id), token);
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    // Lấy tất cả media
    async getAllMedia(token: string): Promise<MediaType[]> {
        try {
            const response = await apiClient.get(API.MEDIA.GET_ALL, token);
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async getAllPlaylist(token: string): Promise<any> {
        try {
            const response = await apiClient.get(API.MEDIA.GET_ALL_PLAYLIST, token);
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    }


    // Lấy media theo trạng thái
    async getMediaByStatus(status: string, token: string): Promise<MediaType[]> {
        try {
            const response = await apiClient.get(API.MEDIA.GET_BY_STATUS(status), token);
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    // Lấy media theo thể loại (genre)
    async getMediaByGenre(genre: string, token: string): Promise<MediaType[]> {
        try {
            const response = await apiClient.get(API.MEDIA.GET_BY_GENRE(genre), token);
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    // Lấy media theo người dùng
    async getMediaByUser(userId: number, token: string): Promise<MediaType[]> {
        try {
            const response = await apiClient.get(API.MEDIA.GET_BY_USER(userId), token);
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    // Lấy media theo playlist
    async getMediaByPlaylist(playlistId: number, token: string): Promise<any> {
        try {
            const response = await apiClient.get(API.MEDIA.GET_BY_PLAYLIST(playlistId), token);
            return response;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    // Lấy danh sách playlist của người dùng
async getMyPlaylist(token: string): Promise<any> {
    try {
        const response = await apiClient.get(API.MEDIA.GET_MY_PLAYLIST, token);
        return response.data;
    } catch (error) {
        return Promise.reject(error);
    }
}

    // Lấy chi tiết một media theo ID
    async getMediaDetail(id: number, userId?: number): Promise<any> {
        try {
            const response = await apiClient.get(API.MEDIA.GET_DETAIL(id, userId));
            return response;
        } catch (error) {
            return Promise.reject(error);
        }
    }

        // Lấy chi tiết một media theo ID
        async getMediaDetailForUser(id: number, userId?: number): Promise<any> {
            try {
                const response = await apiClient.get(API.MEDIA.GET_DETAIL_FOR_USER(id, userId));
                return response;
            } catch (error) {
                return Promise.reject(error);
            }
        }
    
        // Tạo playlist mới
        async createPlaylist(request: any, token: string): Promise<any> {
            try {
                const response = await multipartApiClient.post(API.MEDIA.PLAYLIST_CREATE, request, token);
                return response.data;
            } catch (error) {
                return Promise.reject(error);
            }
        }
    
        // Thêm nhạc vào playlist
        async addToPlaylist(playlistId: number, mediaId: number, token: string): Promise<any> {
            try {
                const response = await apiClient.post(API.MEDIA.PLAYLIST_ADD(playlistId), { mediaId }, token);
                return response.data;
            } catch (error) {
                return Promise.reject(error);
            }
        }

        async search(query: string, token?: string): Promise<MediaType[]> {
            try {
                const response = await apiClient.get(`${API.MEDIA.SEARCH}?q=${encodeURIComponent(query)}`, token);
                return response.data;
            } catch (error) {
                return Promise.reject(error);
            }
        }

            // Tạo playlist yêu thích cho người dùng
    async createFavouritePlaylist(token: string): Promise<any> {
        try {
            const response = await apiClient.post(API.MEDIA.CREATE_FAVOURITE_PLAYLIST, {}, token);
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    // Thêm media vào playlist yêu thích
    async addToFavourite(mediaId: number, token: string): Promise<any> {
        try {
            const response = await apiClient.post(API.MEDIA.ADD_TO_FAVOURITE, { mediaId }, token);
            return response;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async deleteFavourite(mediaId: number, token: string): Promise<any> {
        try {
            const response = await apiClient.delete(API.MEDIA.DELETE_FAVOURITE(mediaId), token);
            return response;  // Lấy dữ liệu từ phản hồi
        } catch (error) {
            return Promise.reject(error);  // Quay lại lỗi nếu có
        }
    }

    // Lấy tất cả media trong playlist yêu thích
    async getAllFavourite(token: string): Promise<any> {
        try {
            const response = await apiClient.get(API.MEDIA.GET_ALL_FAVOURITE, token);
            return response.data;  // Lấy danh sách media từ response
        } catch (error) {
            return Promise.reject(error);
        }
    }
    
    
}

const mediaService = new MediaService();
export default mediaService;

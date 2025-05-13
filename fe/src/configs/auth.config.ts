import { SiSsrn } from "react-icons/si";

    export const API = {
        // Authentication Endpoints
        AUTH: {
            LOGIN: '/auth/login',
            LOGIN_GOOGLE: '/auth/google',
            FETCH_GOOGLE_USER: '/auth/user/google',
            REGISTER: '/auth/register',
            PAYMENT: '/auth/payment',
            CHANGE_AVATAR: '/auth/update-avatar',
            CHANGE_PASSWORD: (id: number) => `/auth/user/${id}/password`,
            UPDATE_USER_INFO: (id: number) => `/auth/user/${id}`,
        },

        // Admin Endpoints for User Management
        ADMIN: {
            USERS: {
                GET_ALL: '/admin/users',
                GET_BY_ID: (id: number) => `/admin/users/${id}`,
                CREATE: '/admin/users',
                UPDATE: (id: number) => `/admin/users/${id}`,
                DELETE: (id: number) => `/admin/users/${id}`,
                UPDATE_ROLE: (id: number) => `/admin/users/${id}/role`,
            },
        },

        // Media Endpoints
        MEDIA: {
            GET_ALL: '/media',
            GET_ALL_PLAYLIST: '/media/playlist',
            CREATE: '/media/create',
            PLAYLIST_CREATE: '/media/playlist/create',
            GET_MY_PLAYLIST: '/media/playlist/me',
            SEARCH: '/media/search',
            CREATE_FAVOURITE_PLAYLIST: '/media/playlist/favourite',  // Tạo playlist yêu thích
            ADD_TO_FAVOURITE: '/media/playlist/favourite/addd', 
            GET_ALL_FAVOURITE: '/media/playlist/favourite', 
            DELETE_FAVOURITE: (mediaId: number) => `/media/playlist/favourite/delete?mediaId=${mediaId}`,
            PLAYLIST_ADD: (id: number) => `/media/playlist/${id}/add`,
            PLAYLIST_DELETE: (id: number) => `/media/playlist/${id}/remove`,
            UPDATE: (id: number) => `/media/${id}`,
            DELETE: (id: number) => `/media/${id}`,
            GET_BY_STATUS: (status: string) => `/media/status/${status}`,
            GET_BY_GENRE: (genre: string) => `/media/genre/${genre}`,
            GET_BY_USER: (userId: number) => `/media/user/${userId}`,
            GET_BY_PLAYLIST: (playlistId: number) => `/media/playlist/${playlistId}`,
            GET_DETAIL: (id: number, userId?: number) => `/media/${id}${userId !== undefined ? `?userId=${userId}` : ''}`,
            GET_DETAIL_FOR_USER: (id: number, userId?: number) => `/media/foruser/${id}${userId !== undefined ? `?userId=${userId}` : ''}`,

            
        },

        COMMENTS: {
            CREATE: '/comments',              // [POST] Tạo bình luận mới
            GET_BY_ID: (id: number) => `/comments/${id}`,  // [GET] Lấy thông tin một bình luận
            DELETE: (id: number) => `/comments/${id}`,     // [DELETE] Xóa bình luận
        },


        // Profile Endpoints
        PROFILE: {
            GET_ME: '/auth/me',
            UPDATE_VIP: (id: number) => `/user/${id}/vip`,
                // Thêm 3 route mới
    GET_USER_PROFILE: (id: number) => `/user/${id}/profile`,  // Lấy thông tin trang cá nhân của người dùng
    UPDATE_PROFILE: (id: number) => `/user/${id}/update`,     // Cập nhật thông tin trang cá nhân
    GET_USER_FOLLOWERS: (id: number) => `/user/${id}/followers`,
        },
    };
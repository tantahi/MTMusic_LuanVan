// user.interface.ts

export interface UserType {
  id: number;
  email: string;
  password: string;
  full_name: string;
  birthday?: Date | null; // birthday có thể là null hoặc undefined
  address?: string | null; // address có thể là null hoặc undefined
  img_url?: string | null; //
  role: 'Admin' | 'Staff' | 'User' | 'Vip User';
  status?: 'Active' | 'Inactive' | 'Banned'; // status có thể là null hoặc undefined
  created_at: Date;
  updated_at: Date;
  vip_start_date?: Date | null; // vip_start_date có thể là null hoặc undefined
  vip_end_date?: Date | null; // vip_end_date có thể là null hoặc undefined
  deleted_at?: Date | null; // deleted_at có thể là null hoặc undefined
  report_count?: number | null; // report_count có thể là null hoặc undefined
  paypalAccountId: any;
  paypalEmail: any;
}

// media.interface.ts

export interface MediaType {
  id: number;
  name?: string | null; // Có thể là null hoặc undefined
  artist_name?: string | null; // Có thể là null hoặc undefined
  img_url?: string | null; // Có thể là null hoặc undefined
  audio_url?: string | null; // Có thể là null hoặc undefined
  description?: string | null; // Có thể là null hoặc undefined
  lyric?: string | null; // Có thể là null hoặc undefined
  duration?: string | null; // Có thể là null hoặc undefined
  media_type: 'Song' | 'Podcast'; // ENUM giá trị cố định
  genre?: 'Pop' | 'Rap' | 'Jazz' | 'Classical' | null; // Có thể là null hoặc undefined
  likes_count?: number | null; // Có thể là null hoặc undefined
  comments_count?: number | null; // Có thể là null hoặc undefined
  reports_count?: number | null; // Có thể là null hoặc undefined
  createdBy?: number | null; // Có thể là null hoặc undefined
  deletedBy?: number | null; // Có thể là null hoặc undefined
  created_at: Date;
  updated_at: Date;
  status: 'Pending' | 'Rejected' | 'Approved'; // ENUM giá trị cố định
  isLiked: boolean | null;
}

export interface PlaylistType {
    id: number;
    name: string;
    genre?: 'Pop' | 'Rap' | 'Jazz' | 'Classical' | null;
    artist_name?: string | null;
    img_url?: string | null;
    user_id: number;
    type: 'Playlist' | 'Album' | 'Favourite';
    created_at: Date;
    items?: MediaType[];
}

// comment.interface.ts

export interface CommentType {
  id: number;
  content: string;
  cusor?: number; // cusor có thể là null hoặc undefined
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null; // deleted_at có thể là null hoặc undefined
  user_id: number;
  media_id: number;
  parent_comment_id?: number | null; // parent_comment_id có thể là null hoặc undefined
}

// Interface cho chi tiết lỗi (details)
export interface ErrorDetail {
  type: string; // Loại lỗi, ví dụ: 'field'
  value: string; // Giá trị gây ra lỗi, ví dụ: 'test@gmail.com'
  msg: string; // Thông báo lỗi, ví dụ: 'Email already in use'
  path: string; // Đường dẫn của trường gây lỗi, ví dụ: 'email'
  location: string; // Vị trí của lỗi, ví dụ: 'body'
}

// Interface cho đối tượng lỗi chính
export interface ValidationError {
  name: string; // Tên của lỗi, ví dụ: 'validation'
  message: string; // Thông báo chung về lỗi, ví dụ: 'Validation failed'
  status: number; // Mã trạng thái HTTP, ví dụ: 400
  details: ErrorDetail[]; // Mảng chứa chi tiết các lỗi
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface PaymentRequest {
  paymentMethodId: string;
  amount: any;
}

export interface ChangePasswordRequest {

}

export interface UpdateUserInfoRequest {

}

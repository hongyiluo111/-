// 用户相关 DTO
export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  diamonds: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileDTO extends UserDTO {
  lastSeen: string;
}

export interface UserListDTO extends Pick<UserDTO, 'id' | 'name' | 'email' | 'role' | 'status'> {
  createdAt: string;
}

// 陪玩相关 DTO
export interface CompanionDTO {
  id: string;
  userId: string;
  name: string;
  game: string;
  rank: string;
  price: number;
  description: string;
  avatar: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanionListDTO extends CompanionDTO {
  userName: string;
  userEmail: string;
}

export interface CompanionApplyDTO {
  name: string;
  game: string;
  rank: string;
  price: number;
  description?: string;
}

export interface CompanionUpdateDTO {
  userId?: string;
  name?: string;
  game?: string;
  rank?: string;
  price?: number;
  description?: string;
  avatar?: string;
  status?: string;
}

// 订单相关 DTO
export interface OrderDTO {
  id: string;
  userId: string;
  companionId: string;
  companionName: string;
  companionRank: string;
  companionAvatar: string;
  game: string;
  price: number;
  status: string;
  paymentId: string | null;
  paymentStatus: string;
  paymentMethod: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface OrderCreateDTO {
  companionId: string;
  game: string;
  price: number;
  duration: number;
}

// 聊天相关 DTO
export interface ChatMessageDTO {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  duration: number | null;
  revoked: boolean;
  read: boolean;
  createdAt: string;
}

export interface ConversationDTO {
  partnerId: string;
  partnerName: string;
  lastMessage: ChatMessageDTO;
  unreadCount: number;
}

// 好友相关 DTO
export interface FriendDTO {
  id: string;
  userId: string;
  friendId: string;
  friendName: string;
  status: string;
  createdAt: string;
}

export interface FriendRequestDTO {
  friendId: string;
}

// 通知相关 DTO
export interface NotificationDTO {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  read: boolean;
  createdAt: string;
}

// 支付相关 DTO
export interface PaymentCreateDTO {
  orderId: string;
  amount: number;
  method: 'alipay' | 'wechat';
}

export interface PaymentCallbackDTO {
  orderId: string;
  paymentId: string;
  status: string;
}

// 认证相关 DTO
export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ResetPasswordDTO {
  email: string;
}

export interface UpdatePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

// 通用响应 DTO
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

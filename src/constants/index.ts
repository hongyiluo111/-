// 用户角色
export const USER_ROLE = {
  USER: 'user',
  ADMIN: 'admin',
  CLUB_ADMIN: 'club_admin',
} as const;

export type UserRole = typeof USER_ROLE[keyof typeof USER_ROLE];

// 用户状态
export const USER_STATUS = {
  ACTIVE: 'active',
  BANNED: 'banned',
} as const;

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];

// 陪玩状态
export const COMPANION_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  PAUSED: 'paused',
  INACTIVE: 'inactive',
} as const;

export type CompanionStatus = typeof COMPANION_STATUS[keyof typeof COMPANION_STATUS];

// 订单状态
export const ORDER_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

// 支付状态
export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  REFUNDED: 'refunded',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

// 支付方式
export const PAYMENT_METHOD = {
  ALIPAY: 'alipay',
  WECHAT: 'wechat',
} as const;

export type PaymentMethod = typeof PAYMENT_METHOD[keyof typeof PAYMENT_METHOD];

// 消息类型
export const MESSAGE_TYPE = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  VOICE: 'voice',
} as const;

export type MessageType = typeof MESSAGE_TYPE[keyof typeof MESSAGE_TYPE];

// 好友状态
export const FRIEND_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
} as const;

export type FriendStatus = typeof FRIEND_STATUS[keyof typeof FRIEND_STATUS];

// 通知类型
export const NOTIFICATION_TYPE = {
  ORDER: 'order',
  CHAT: 'chat',
  SYSTEM: 'system',
  FRIEND: 'friend',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPE[keyof typeof NOTIFICATION_TYPE];

// 订单状态中文映射
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '待接单',
  accepted: '已接单',
  in_progress: '进行中',
  completed: '已完成',
  cancelled: '已取消',
};

// 订单状态颜色映射
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

// 支付状态中文映射
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: '未支付',
  paid: '已支付',
  refunded: '已退款',
};

// 陪玩状态中文映射
export const COMPANION_STATUS_LABELS: Record<CompanionStatus, string> = {
  pending: '待审核',
  active: '已上架',
  paused: '已暂停',
  inactive: '已下架',
};

// 游戏列表
export const GAMES = [
  '三角洲行动',
  '王者荣耀',
  '英雄联盟',
  '和平精英',
  'CS2',
  '无畏契约',
  '穿越火线',
  '金铲铲之战',
] as const;

export type Game = typeof GAMES[number];

// 段位列表（按游戏分组）
export const RANKS: Record<Game, string[]> = {
  '三角洲行动': ['青铜', '白银', '黄金', '铂金', '钻石', '大师', '王者'],
  '王者荣耀': ['青铜', '白银', '黄金', '铂金', '钻石', '星耀', '王者'],
  '英雄联盟': ['黑铁', '青铜', '白银', '黄金', '铂金', '钻石', '大师', '宗师', '王者'],
  '和平精英': ['青铜', '白银', '黄金', '铂金', '钻石', '星钻', '超级王牌', '无敌战神'],
  'CS2': ['白银', '黄金', 'AK', '双AK', '老鹰', '小地球', '大地球'],
  '无畏契约': ['黑铁', '青铜', '白银', '黄金', '铂金', '钻石', '超凡入圣', '神话', '传奇'],
  '穿越火线': ['新锐', '精英', '专家', '大师', '枪王', '传奇', '荣耀枪王'],
  '金铲铲之战': ['青铜', '白银', '黄金', '铂金', '钻石', '大师', '宗师', '王者'],
};

// 价格范围
export const PRICE_RANGES = [
  { label: '0-50元', value: '0-50' },
  { label: '50-100元', value: '50-100' },
  { label: '100-200元', value: '100-200' },
  { label: '200元以上', value: '200+' },
] as const;

// 分页配置
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

// JWT 配置
export const JWT_CONFIG = {
  SECRET_MIN_LENGTH: 32,
  DEFAULT_EXPIRY: '7d',
  REMEMBER_ME_EXPIRY: '30d',
} as const;

// Cookie 配置
export const COOKIE_CONFIG = {
  NAME: 'token',
  DEFAULT_MAX_AGE: 7 * 24 * 60 * 60, // 7天
  REMEMBER_ME_MAX_AGE: 30 * 24 * 60 * 60, // 30天
} as const;

// API 限流配置
export const RATE_LIMIT = {
  LOGIN: { windowMs: 15 * 60 * 1000, max: 5 }, // 15分钟内最多5次
  REGISTER: { windowMs: 60 * 60 * 1000, max: 3 }, // 1小时内最多3次
  DEFAULT: { windowMs: 60 * 1000, max: 60 }, // 1分钟内最多60次
} as const;

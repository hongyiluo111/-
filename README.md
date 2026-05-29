# 鸿一电竞陪玩平台

一个专业的电竞陪玩平台，连接游戏高手与玩家，提供高质量的陪玩服务。

## 技术栈

### 前端
- **Next.js 15** (App Router) — 全栈框架
- **React 19** — UI 库
- **TypeScript 5.4** — 类型安全
- **Tailwind CSS 3.4** + **shadcn/ui** (Radix UI) — 样式与组件
- **Zustand** — 全局状态管理
- **TanStack React Query** — 服务端数据缓存
- **Pusher JS** — 实时聊天 / 订单推送
- **Lucide React** — 图标库

### 后端
- **Next.js API Routes** — RESTful API（支付回调、AI 聊天、用户信息等）
- **Next.js Server Actions** — 表单提交与认证逻辑
- **Prisma ORM + MySQL** (MariaDB 适配器) — 数据持久化
- **JWT** (jsonwebtoken) — 无状态认证
- **bcrypt** — 密码哈希

### 支付
- **微信支付** (wechatpay-node-v3)
- **支付宝** (alipay-sdk)
- 订单状态机防超发，`paymentId` 关联支付与订单

### AI
- **阿里云通义千问** (DashScope) — `qwen-turbo` 模型

### 数据库
- MySQL / MariaDB
- 默认连接：`localhost:3306`，用户 `root`，数据库 `game`
- Prisma Client 数据库推送（非迁移模式）：
  ```bash
  npx prisma db push && npx prisma generate
  ```

---

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.local` 并填写：

```env
# 必填
DATABASE_URL="mysql://root:你的密码@localhost:3306/game?charset=utf8mb4"
JWT_SECRET="随机生成的64位十六进制字符串"
QWEN_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# 可选 — 实时推送
NEXT_PUBLIC_PUSHER_KEY="your-pusher-key"
NEXT_PUBLIC_PUSHER_CLUSTER="your-pusher-cluster"

# 可选 — 微信支付
WECHAT_APPID=""
WECHAT_MCHID=""
WECHAT_PUBLIC_KEY=""
WECHAT_PRIVATE_KEY=""

# 可选 — 支付宝（沙箱环境）
ALIPAY_APP_ID=""
ALIPAY_PRIVATE_KEY=""
ALIPAY_PUBLIC_KEY=""
ALIPAY_GATEWAY="https://openapi-sandbox.dl.alipaydev.com/gateway.do"
```

> ⚠️ `JWT_SECRET` 和 `QWEN_API_KEY` 为必填项，未配置时服务将返回 503。

### 3. 初始化数据库

```bash
npx prisma db push && npx prisma generate
```

### 4. 启动开发服务器

```bash
npm run dev
# → http://localhost:3000
```

### 生产构建

```bash
npm run build && npm start
```

---

## 项目结构

```
src/
├── app/                        # Next.js App Router
│   ├── actions/                # Server Actions (auth, order, user)
│   ├── api/                    # API Routes
│   │   ├── admin/              # 后台管理接口
│   │   ├── ai/chat/            # AI 聊天接口
│   │   ├── auth/               # 认证接口
│   │   ├── orders/             # 订单接口
│   │   ├── payment/            # 支付（创建/回调/通知）
│   │   └── profile/            # 用户资料
│   ├── admin/                  # 后台页面
│   │   ├── companions/         # 陪玩管理
│   │   ├── orders/             # 订单管理
│   │   ├── users/              # 用户管理
│   │   └── settings/           # 系统设置
│   ├── find-companion/         # 找陪玩
│   ├── become-companion/       # 成为陪玩
│   ├── login/ register/        # 登录/注册
│   ├── orders/                 # 我的订单
│   ├── profile/                # 个人中心
│   └── layout.tsx              # 根布局
├── components/
│   ├── ui/                     # 基础 UI 组件
│   ├── MagneticButton.tsx      # 磁性跟随按钮
│   ├── TiltCard.tsx            # 3D 倾斜卡片
│   ├── ChatModal.tsx           # 公共聊天弹窗
│   ├── BookingModal.tsx        # 预约弹窗
│   ├── CompanionList.tsx       # 陪玩列表（分页 + IntersectionObserver）
│   ├── FeaturedCompanions.tsx  # 热门陪玩
│   ├── FilterBar.tsx           # 筛选栏（游戏/段位/价格）
│   ├── GameList.tsx            # 游戏网格
│   ├── Navbar.tsx              # 导航栏（滚动时自动隐藏）
│   ├── Hero.tsx                # 首页展示区
│   ├── Footer.tsx              # 页脚
│   ├── AIService.tsx           # 侧边 AI 助手
│   └── Skeleton.tsx            # 骨架屏占位
├── data/
│   ├── companions.ts           # 陪玩种子数据
│   ├── gameColors.ts           # 游戏主题色映射
│   └── orderConstants.ts       # 订单状态常量
├── hooks/
│   ├── useReducedMotion.ts     # 系统减弱动画偏好检测
│   └── useIsDesktop.ts         # 桌面端设备检测
├── lib/
│   ├── db.ts                   # Prisma 客户端单例
│   ├── jwt.ts                  # JWT 签发与验证
│   ├── payment.ts              # 支付 SDK 封装
│   └── pusher.ts               # Pusher 服务端配置
├── store/
│   └── user.ts                 # Zustand 用户状态
├── utils/
│   ├── date.ts                 # formatDate
│   └── order-state-machine.ts  # 订单状态流转约束
└── prisma/
    └── schema.prisma           # 数据模型定义
```

---

## UI/UX 特性

### 交互动画
- **磁性按钮** (`MagneticButton`) — 鼠标靠近时按钮跟随光标偏移，按压时缩放到 97%
- **3D 倾斜卡片** (`TiltCard`) — 鼠标悬停时卡片随光标轻倾斜，带光泽效果
- 以上效果**仅桌面端**生效，通过 `pointer: fine` 媒体查询检测
- 完整兼容 `prefers-reduced-motion: reduce`，开启后动画自动禁用

### 其他交互
- **滚动隐藏导航栏** — 向下滚动时导航栏自动收起，停止后重新显示
- **IntersectionObserver 渐进显示** — 陪玩卡片进入视口时 opacity 渐入
- **骨架屏** — 陪玩列表加载中自动展示骨架屏占位
- **按钮 Ripple 波纹** — 全局按钮点击波纹反馈
- **空状态与错误处理** — 所有列表/订单页均有空状态和错误提示

---

## 数据库模型

| 模型 | 说明 |
|------|------|
| **User** | 用户（id, email, password, name, role, status, diamonds） |
| **Companion** | 陪玩（绑定 userId, game, rank, price, status） |
| **Order** | 订单（userId, companionId, price, status, paymentId, paymentStatus） |
| **Notification** | 通知（userId, type, title, message, read） |
| **ChatMessage** | 聊天记录（senderId, receiverId, content, type） |
| **Friend** | 好友关系 |

---

## 订单状态流转

```
PENDING ──→ ACCEPTED ──→ IN_PROGRESS ──→ COMPLETED
   │            │
   └── CANCELLED ←────────┘
```

状态约束通过 `order-state-machine.ts` 中的 `canTransition()` 函数实现。

---

## 支付流程

```
用户创建订单 → 选择支付方式 → /api/payment/create 生成 paymentUrl + paymentId
→ 存储 paymentId 到 Order 表 → 用户完成支付
→ 支付宝异步通知 /api/payment/alipay/notify（根据 paymentId 查找订单）
→ 更新 paymentStatus = 'paid'
```

---

## 认证与安全

- **JWT Token** — 7 天有效期，存储在 httpOnly Cookie 中
- **密码** — bcrypt 哈希，API 响应中不返回密码字段（`select` 排除）
- **`JWT_SECRET`** — 必填环境变量，缺失时直接抛出错误拒绝启动
- **`QWEN_API_KEY`** — 仅通过环境变量注入，源码中无硬编码

---

## 公共模块

| 模块 | 用途 |
|------|------|
| `@/data/gameColors` | 12 款游戏的主题色 + `getGameColor()` 工具函数 |
| `@/utils/date` | `formatDate()` 日期格式化 |
| `@/data/orderConstants` | `statusLabels` / `statusColors` / `paymentLabels` 常量 |
| `@/components/ChatModal` | 陪玩聊天弹窗（AI 对话 + 历史记录） |

---

## 许可证

MIT License

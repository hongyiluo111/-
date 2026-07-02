# 电竞陪玩平台

一个专业的电竞陪玩平台，连接游戏高手与玩家，提供高质量的陪玩服务。支持在线预约、实时聊天、支付下单、俱乐部社交等功能。

---

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 运行时 | Node.js | v20+ (推荐 v20 LTS 或 v22+) |
| 包管理 | npm | v10+ |
| 前端框架 | Next.js (App Router) | 14.2.9 |
| UI 框架 | React | 18.3.1 |
| 类型系统 | TypeScript | 5.4.5 |
| 样式方案 | Tailwind CSS + shadcn/ui (Radix UI) | 3.4.3 |
| 状态管理 | Zustand | 4.5.7 |
| 数据缓存 | TanStack React Query | 5.x |
| ORM | Prisma (MariaDB 适配器) | 7.8.0 |
| 数据库 | MySQL / MariaDB | 5.7+ / 10.5+ |
| 认证 | JWT (jsonwebtoken) + bcrypt | 9.x / 6.x |
| 实时通信 | Pusher | 5.x (服务端) / 8.x (客户端) |
| 图标库 | Lucide React | 1.7.x |
| 测试 | Playwright | 1.60.x |

---

## 快速开始

### 1. 环境准备

确保已安装以下软件：

- **Node.js** v20 或更高版本（[下载](https://nodejs.org/)）
- **MySQL** 5.7+ 或 **MariaDB** 10.5+
- **npm** v10+（随 Node.js 附带）

### 2. 创建数据库

登录 MySQL/MariaDB，执行建表脚本：

```bash
mysql -u root -p < db/schema.sql
```

如需导入测试数据：

```bash
mysql -u root -p game < db/data.sql
```

### 3. 安装依赖

```bash
npm install
```

### 4. 配置环境变量

复制示例文件并填写：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填写以下内容：

```env
# 数据库连接（修改密码为你自己的 MySQL 密码）
DATABASE_URL="mysql://root:你的密码@localhost:3306/game?charset=utf8mb4"

# JWT 密钥（至少 32 位随机字符串，用于用户认证令牌签发）
JWT_SECRET="your-random-secret-key-at-least-32-chars-long"

# AI 助手 API 密钥（阿里云通义千问 DashScope）
QWEN_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# 应用地址
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 5. 同步数据库模型

```bash
npx prisma db push
npx prisma generate
```

### 6. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 生产构建

```bash
npm run build
npm start
```

---

## AI API 密钥申请

本项目使用**阿里云通义千问（DashScope）**的 `qwen-turbo` 模型提供 AI 聊天助手功能。

**申请步骤：**

1. 访问 [阿里云百炼平台](https://bailian.console.aliyun.com/)
2. 注册/登录阿里云账号
3. 开通 DashScope 服务
4. 在「API-KEY 管理」中创建 API Key
5. 将获取的 Key 填入 `.env.local` 的 `QWEN_API_KEY` 字段

> 如不配置 AI 功能，平台其他功能仍可正常使用。

---

## 测试账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | `admin@example.com` | `123456` |
| 普通用户 | `test@example.com` | `123456` |
| 陪玩师（王五） | `wangwu@example.com` | `123456` |
| 陪玩师（赵六） | `zhaoliu@example.com` | `123456` |
| 陪玩师（孙七） | `sunqi@example.com` | `123456` |

- 管理员后台地址：`/admin`
- 普通用户登录后可浏览陪玩、下单、聊天
- 陪玩师登录后可进入「陪玩中心」管理订单和收入

---

## 项目结构

```
电竞陪玩平台/
├── db/                           # 数据库脚本
│   ├── schema.sql                # 建表 SQL
│   └── data.sql                  # 测试数据
├── prisma/                       # Prisma ORM
│   ├── schema.prisma             # 数据模型定义
│   └── migrations/               # 迁移记录
├── src/
│   ├── app/                      # Next.js App Router 页面
│   │   ├── actions/              # Server Actions (认证、订单、用户)
│   │   ├── api/                  # API Routes
│   │   │   ├── admin/            # 后台管理接口
│   │   │   ├── ai/chat/          # AI 聊天接口
│   │   │   ├── auth/             # 认证接口（登录/注册/找回密码）
│   │   │   ├── chat/             # 聊天接口（消息/会话/已读）
│   │   │   ├── clubs/            # 俱乐部接口
│   │   │   ├── companion/        # 陪玩师后台接口
│   │   │   ├── companions/       # 陪玩列表/申请接口
│   │   │   ├── feed/             # 动态接口
│   │   │   ├── friends/          # 好友接口
│   │   │   ├── orders/           # 订单接口
│   │   │   ├── payment/          # 支付接口（支付宝/微信）
│   │   │   ├── profile/          # 个人资料接口
│   │   │   ├── rankings/         # 排行榜接口
│   │   │   ├── reviews/          # 评价接口
│   │   │   └── user/             # 用户状态接口
│   │   ├── admin/                # 后台管理页面
│   │   ├── clubs/                # 俱乐部页面
│   │   ├── companion/            # 陪玩中心页面
│   │   ├── find-companion/       # 找陪玩页面
│   │   ├── friends/              # 好友页面
│   │   ├── messages/             # 消息页面
│   │   ├── orders/               # 我的订单页面
│   │   ├── profile/              # 个人中心页面
│   │   ├── rankings/             # 排行榜页面
│   │   └── (login/register/...)  # 登录/注册等页面
│   ├── components/               # React 组件
│   │   ├── ui/                   # 基础 UI 组件 (button/input/select)
│   │   ├── chat/                 # 聊天组件
│   │   ├── voice/                # 语音房间组件
│   │   ├── Navbar.tsx            # 导航栏（滚动自动隐藏）
│   │   ├── Hero.tsx              # 首页展示区
│   │   ├── CompanionList.tsx     # 陪玩列表（分页 + IntersectionObserver）
│   │   ├── BookingModal.tsx      # 预约弹窗
│   │   ├── AIService.tsx         # AI 助手侧边栏
│   │   └── ...                   # 其他业务组件
│   ├── data/                     # 静态数据
│   ├── hooks/                    # 自定义 Hooks
│   ├── lib/                      # 工具库（db/jwt/payment/pusher）
│   ├── store/                    # Zustand 状态管理
│   ├── types/                    # TypeScript 类型定义
│   └── utils/                    # 工具函数
├── public/                       # 静态资源
├── package.json                  # 项目依赖
├── tsconfig.json                 # TypeScript 配置
├── tailwind.config.js            # Tailwind CSS 配置
├── next.config.js                # Next.js 配置
└── .env.example                  # 环境变量示例
```

---

## 数据库模型

| 模型 | 说明 |
|------|------|
| User | 用户（id, email, password, name, role, status, diamonds） |
| Companion | 陪玩师（绑定 userId, game, rank, price, status） |
| Order | 订单（userId, companionId, price, status, paymentId） |
| Review | 评价（orderId, rating, content） |
| Earning | 收入记录（companionId, orderId, amount） |
| ChatMessage | 聊天消息（senderId, receiverId, content, type） |
| Friend | 好友关系 |
| Notification | 通知（userId, type, title, message） |
| Club | 俱乐部（name, gameId, ownerId） |
| ClubMember | 俱乐部成员 |
| Post | 动态（userId, content, game） |
| PostLike | 动态点赞 |
| PasswordReset | 密码重置令牌 |
| AdminLog | 管理员操作日志 |

---

## 核心功能

### 用户端
- 浏览陪玩列表，按游戏/段位/价格筛选
- 在线下单预约陪玩，支持支付宝/微信支付
- 与陪玩师实时聊天（文字/图片/语音）
- 好友系统，添加/搜索好友
- 动态发布与点赞
- 排行榜查看热门陪玩和俱乐部
- 俱乐部加入与管理
- AI 智能助手（通义千问）

### 陪玩师端
- 申请成为陪玩师
- 接单/拒单/开始/完成订单管理
- 收入统计与提现
- 个人主页与评价查看

### 管理员端
- 用户管理（查看/禁用）
- 陪玩师审核（通过/拒绝）
- 订单管理
- 系统数据统计

---

## 订单状态流转

```
PENDING ──→ ACCEPTED ──→ IN_PROGRESS ──→ COMPLETED
   │            │
   └──→ CANCELLED ←────┘
```

状态约束通过 `src/utils/order-state-machine.ts` 中的 `canTransition()` 函数实现。

---

## 可选配置

### Pusher 实时通信

用于聊天消息实时推送和订单通知：

1. 注册 [Pusher](https://pusher.com/) 账号
2. 创建应用，获取 Key/Cluster/AppId/Secret
3. 填入 `.env.local`

### 支付功能

- **支付宝沙箱**：在 [支付宝开放平台](https://open.alipay.com/) 申请沙箱应用
- **微信支付**：在 [微信支付商户平台](https://pay.weixin.qq.com/) 申请商户号

> 支付功能为可选配置，未配置时下单流程仍可走通（模拟支付）。

---

## 许可证

MIT License

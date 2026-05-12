# 鸿一电竞陪玩平台

一个专业的电竞陪玩平台，连接游戏高手与玩家，提供高质量的陪玩服务。

## 技术栈

### 前端
- Next.js 15 (App Router)
- React 18.2.0
- TypeScript
- Tailwind CSS + shadcn/ui
- React Query (数据获取)
- Zustand (状态管理)
- Pusher JS (实时聊天/订单推送)

### 后端
- Next.js Server Actions (服务端逻辑)
- API Routes (支付回调、AI聊天、用户信息)
- 无额外后端服务

### 数据库
- Prisma + MySQL
- 本地数据库配置：localhost:3306, 用户名root, 密码123456, 数据库名game
- 适配器: PrismaMariaDb

### 支付
- 微信支付 SDK (wechatpay-node-v3)
- 支付宝 SDK (alipay-sdk)
- 订单表 + 状态机（防超发）

### 认证
- JWT Token 认证 (jsonwebtoken)
- bcrypt 密码加密

### AI
- 阿里云通义千问 API (DashScope)

## 功能特性

### 核心功能
1. **用户认证**：登录、注册、登出、JWT Token认证
2. **订单管理**：创建订单、查看订单、订单状态管理
3. **陪玩管理**：成为陪玩、找陪玩、筛选陪玩
4. **实时通信**：Pusher实时聊天、订单推送
5. **支付集成**：微信支付、支付宝支付
6. **AI助手**：侧边AI聊天助手（通义千问）
7. **管理员后台**：用户管理、陪玩管理、订单管理

### 游戏支持
- 三角洲行动
- 王者荣耀
- 英雄联盟
- 英雄联盟手游
- 和平精英
- VALORANT
- 金铲铲之战
- 穿越火线
- 第五人格
- 蛋仔派对
- 暗区突围
- CS2

## 安装与运行

### 1. 克隆项目

```bash
git clone <项目地址>
cd 电竞陪玩平台
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置数据库

确保本地MySQL数据库已启动，并且创建了名为`game`的数据库。

### 4. 数据库迁移

```bash
npx prisma migrate dev --name init
```

### 5. 生成Prisma客户端

```bash
npx prisma generate
```

### 6. 启动开发服务器

```bash
npm run dev
```

项目将运行在 http://localhost:3000

## 环境变量

在`.env.local`文件中配置以下环境变量：

```env
DATABASE_URL="mysql://root:123456@localhost:3306/game"
JWT_SECRET="your-jwt-secret-key"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NEXT_PUBLIC_PUSHER_KEY="your-pusher-key"
NEXT_PUBLIC_PUSHER_CLUSTER="your-pusher-cluster"
WECHAT_APPID="your-wechat-appid"
WECHAT_MCHID="your-wechat-mchid"
WECHAT_PUBLIC_KEY="your-wechat-public-key"
WECHAT_PRIVATE_KEY="your-wechat-private-key"
ALIPAY_APP_ID="your-alipay-appid"
ALIPAY_PRIVATE_KEY="your-alipay-private-key"
ALIPAY_PUBLIC_KEY="your-alipay-public-key"
ALIPAY_GATEWAY="https://openapi-sandbox.dl.alipaydev.com/gateway.do"
```

## 生产部署

### 1. 构建项目

```bash
npm run build
```

### 2. 启动生产服务器

```bash
npm start
```

## 技术文档

### 订单状态机

订单状态流转：
- PENDING (待接单) → ACCEPTED (已接单) → IN_PROGRESS (进行中) → COMPLETED (已完成)
- PENDING (待接单) → CANCELLED (已取消)
- ACCEPTED (已接单) → CANCELLED (已取消)

### 认证系统

- 使用JWT Token进行用户认证
- Token有效期7天
- 通过 `/api/auth/current-user` API 获取当前用户信息
- 客户端组件通过fetch调用API，避免直接调用Server Actions

### 实时通信

使用Pusher JS实现：
- 订单状态实时更新
- 陪玩与玩家实时聊天
- 新订单推送通知

### AI助手

- 使用阿里云通义千问API
- 侧边聊天窗口，支持展开/收起
- 实时消息发送和接收

### 支付流程

1. 用户创建订单
2. 选择支付方式（微信支付/支付宝）
3. 调用支付SDK生成支付链接
4. 用户完成支付
5. 支付回调更新订单状态

## 代码规范

### 组件规范
- 客户端组件使用 `'use client'` 指令
- 避免在客户端组件中直接调用Server Actions
- 使用API路由进行客户端与服务端的数据交互

### 样式规范
- 使用Tailwind CSS进行样式编写
- 不使用 `<style jsx>` 标签（Next.js 15不支持）
- 使用 `cn()` 工具函数合并类名

### 状态管理
- 使用Zustand进行全局状态管理
- 用户状态通过API获取并存储在Zustand store中

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

## 许可证

MIT License

## 联系我们

- 邮箱：contact@hongyigaming.com
- 官网：https://hongyigaming.com

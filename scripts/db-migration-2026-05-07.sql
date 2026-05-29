-- =====================================================
-- 电竞陪玩平台 - 数据库变更脚本
-- 执行时间: 2026-05-07
-- =====================================================

-- 1. 添加 PasswordReset 表（忘记密码功能）
CREATE TABLE IF NOT EXISTS `PasswordReset` (
    `id` VARCHAR(191) NOT NULL DEFAULT (concat('cuid_', replace(cuid(), '-', ''))),
    `email` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `PasswordReset_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. 给 ChatMessage 表添加 read 字段（标记已读功能）
ALTER TABLE `ChatMessage` ADD COLUMN `read` BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS `ChatMessage_receiverId_read_key` ON `ChatMessage`(`receiverId`, `read`);

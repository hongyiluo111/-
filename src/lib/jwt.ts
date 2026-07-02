import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      'JWT_SECRET 环境变量未设置。请在 .env.local 中配置: JWT_SECRET=<your-random-secret>'
    );
  }
  if (secret.length < 32) {
    throw new Error(
      'JWT_SECRET 长度不足，至少需要 32 个字符。请使用更长的随机密钥。'
    );
  }
  return secret;
}

export function generateToken(userId: string, email: string, role: string, rememberMe: boolean = false) {
  return jwt.sign(
    { userId, email, role },
    getSecret(),
    { algorithm: 'HS256', expiresIn: rememberMe ? '30d' : '7d' }
  );
}

export function verifyToken(token: string) {
  try {
    // 显式指定允许的算法，防止算法混淆攻击（如 alg=none 或 RS256 伪造）
    const decoded = jwt.verify(token, getSecret(), { algorithms: ['HS256'] }) as {
      userId: string;
      email: string;
      role: string;
    };
    // 运行时校验 payload 结构
    if (!decoded || typeof decoded.userId !== 'string' || typeof decoded.email !== 'string') {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string, rememberMe: boolean = false) {
  const cookieStore = await cookies();
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge,
    path: '/',
  });
}

export async function getAuthCookie() {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value;
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
}

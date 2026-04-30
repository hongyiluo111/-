import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export function generateToken(userId: string, email: string, role: string) {
  return jwt.sign(
    { userId, email, role },
    SECRET_KEY,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET_KEY) as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}

export function setAuthCookie(token: string) {
  cookies().set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });
}

export function getAuthCookie() {
  return cookies().get('token')?.value;
}

export function clearAuthCookie() {
  cookies().delete('token');
}

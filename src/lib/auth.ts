import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export function getUserIdFromRequest(request: NextRequest): string | null {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  if (!decoded?.userId) {
    return null;
  }

  return decoded.userId;
}

export function requireAuth(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return { error: NextResponse.json({ error: '未登录' }, { status: 401 }) };
  }

  const user = verifyToken(token);
  if (!user) {
    return { error: NextResponse.json({ error: '登录已过期' }, { status: 401 }) };
  }

  return { user };
}

export function requireAdmin(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return { error: NextResponse.json({ error: '未登录' }, { status: 401 }) };
  }

  const user = verifyToken(token);
  if (!user || user.role !== 'admin') {
    return { error: NextResponse.json({ error: '无权限' }, { status: 403 }) };
  }

  return { user };
}

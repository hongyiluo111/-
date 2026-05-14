import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export function getAdminFromRequest(request: NextRequest) {
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

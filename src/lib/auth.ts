import { NextRequest } from 'next/server';
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

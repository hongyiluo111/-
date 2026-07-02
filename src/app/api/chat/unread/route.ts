export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ count: 0 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ count: 0 });

    const lastCheck = request.nextUrl.searchParams.get('after');
    const where: Record<string, unknown> = {
      receiverId: decoded.userId,
      read: false,
      revoked: false,
    };
    if (lastCheck) {
      const afterDate = new Date(Number(lastCheck));
      if (!isNaN(afterDate.getTime())) {
        where.createdAt = { gt: afterDate };
      }
    }

    const count = await prisma.chatMessage.count({ where });
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}

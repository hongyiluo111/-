import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ diamonds: 0 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ diamonds: 0 });

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { diamonds: true },
    });

    return NextResponse.json({ diamonds: user?.diamonds ?? 0 });
  } catch {
    return NextResponse.json({ diamonds: 0 });
  }
}

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const { receiverId } = await request.json();
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: '未登录' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: '登录已过期' }, { status: 401 });

    const { allowed } = rateLimit(`chat-typing:${decoded.userId}`, 20, 60000);
    if (!allowed) return NextResponse.json({ success: true });

    try {
      const { getPusherServer } = await import('@/lib/pusher-server');
      const channelName = `chat-${[decoded.userId, receiverId].sort().join('-')}`;
      await getPusherServer().trigger(channelName, 'typing', { userId: decoded.userId });
    } catch {
      console.error('Pusher typing 推送失败');
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '推送失败' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/actions/auth.actions';
import { createLiveKitToken } from '@/lib/livekit';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const body = await request.json();
    const { roomName } = body as { roomName: string };

    if (!roomName || typeof roomName !== 'string') {
      return NextResponse.json({ error: '缺少 roomName' }, { status: 400 });
    }

    const token = await createLiveKitToken(roomName, user.id, user.name);
    return NextResponse.json({ token });
  } catch (error) {
    console.error('LiveKit token generation failed:', error);
    return NextResponse.json({ error: 'token 生成失败' }, { status: 500 });
  }
}

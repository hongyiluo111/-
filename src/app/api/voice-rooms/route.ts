export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/actions/auth.actions';

/**
 * POST /api/voice-rooms
 * Body: { type: 'order'|'club', orderId?, clubId?, name? }
 * 房间 ID 格式: {type}-{entityId}
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const body = await request.json();
    const { type = 'custom', orderId, clubId, name } = body as {
      type?: string;
      orderId?: string;
      clubId?: string;
      name?: string;
    };

    const roomId =
      type === 'order' && orderId ? `order-${orderId}` :
      type === 'club' && clubId ? `club-${clubId}` :
      `${type}-${Date.now()}`;

    const roomName = name || (
      type === 'order' ? '订单语音房间' :
      type === 'club' ? '俱乐部语音大厅' :
      '语音房间'
    );

    return NextResponse.json({
      room: {
        id: roomId,
        name: roomName,
        type,
        channels: [
          { id: `${roomId}-lobby`, name: '大厅', sortOrder: 0 },
          { id: `${roomId}-chat`, name: '闲聊', sortOrder: 1 },
        ],
      },
    });
  } catch (error) {
    console.error('Create voice room failed:', error);
    return NextResponse.json({ error: '创建房间失败' }, { status: 500 });
  }
}

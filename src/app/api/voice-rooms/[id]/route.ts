export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/actions/auth.actions';

/**
 * GET /api/voice-rooms/[id]
 * 返回指定语音房间的详情，包含频道信息。
 * 房间 ID 格式: order-{orderId} / club-{clubId} / custom-{timestamp}
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const roomId = params.id;
    if (!roomId) {
      return NextResponse.json({ error: '缺少房间 ID' }, { status: 400 });
    }

    // 从 roomId 推断房间类型
    let type = 'custom';
    if (roomId.startsWith('order-')) type = 'order';
    else if (roomId.startsWith('club-')) type = 'club';

    const roomName =
      type === 'order' ? '订单语音房间' :
      type === 'club' ? '俱乐部语音大厅' :
      '语音房间';

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
    console.error('Get voice room failed:', error);
    return NextResponse.json({ error: '获取房间信息失败' }, { status: 500 });
  }
}

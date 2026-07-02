'use client';

import { useState } from 'react';
import { useVoiceRoomStore } from '@/store/voiceRoom';
import { useVoiceRoom } from '@/hooks/useVoiceRoom';
import { useUserStore } from '@/store/user';

interface Props {
  roomId?: string;
  roomName?: string;
  type?: 'order' | 'club';
  orderId?: string;
  clubId?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function VoiceRoomEntry({
  roomId: existingRoomId,
  roomName,
  type = 'order',
  orderId,
  clubId,
  className = '',
  children,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const user = useUserStore((s) => s.user);
  const voiceRoom = useVoiceRoomStore();
  const { joinRoom } = useVoiceRoom(user?.id || null);

  const handleClick = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    // Already in a room
    if (voiceRoom.isOpen && voiceRoom.roomId) {
      voiceRoom.setMinimized(false);
      voiceRoom.setOpen(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      let targetRoomId = existingRoomId;

      // Create or find room
      if (!targetRoomId) {
        const res = await fetch('/api/voice-rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            orderId: orderId || undefined,
            clubId: clubId || undefined,
            name: roomName || (type === 'club' ? '俱乐部语音大厅' : '语音房间'),
          }),
        });

        if (!res.ok) {
          throw new Error('创建房间失败');
        }

        const data = await res.json();
        targetRoomId = data.room.id;
      }

      if (targetRoomId) {
        await joinRoom(targetRoomId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className={className || 'btn btn-primary gap-2'}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            连接中...
          </>
        ) : children ? (
          children
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            进入语音房间
          </>
        )}
      </button>
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}

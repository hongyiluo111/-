'use client';

import { useState, useEffect, useRef } from 'react';
import { useVoiceRoomStore } from '@/store/voiceRoom';

export default function VoiceRoomFloating() {
  const {
    roomId, roomName, isOpen, isMinimized, channels, currentChannelId,
    members, joinedAt, setMinimized, setOpen,
  } = useVoiceRoomStore();

  const [callDuration, setCallDuration] = useState('00:00');
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null);

  useEffect(() => {
    if (!joinedAt) return;
    const timer = setInterval(() => {
      const diff = Date.now() - joinedAt;
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setCallDuration(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [joinedAt]);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      if (!dragStartRef.current) return;
      setPosition({
        x: dragStartRef.current.posX + (e.clientX - dragStartRef.current.x),
        y: dragStartRef.current.posY + (e.clientY - dragStartRef.current.y),
      });
    };
    const onUp = () => { setIsDragging(false); dragStartRef.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging]);

  if (!isOpen || !roomId || !isMinimized) return null;

  const currentChannel = channels.find((c) => c.id === currentChannelId);
  const channelMembers = members.filter((m) => m.channelId === currentChannelId);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY, posX: position.x, posY: position.y };
  };

  return (
    <div
      className="fixed z-[99] select-none"
      style={{
        right: 16 + position.x,
        bottom: 80 + position.y,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
    >
      <button
        onClick={() => {
          setMinimized(false);
          setOpen(true);
        }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-3 min-w-[180px] text-left hover:shadow-2xl transition-shadow"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">
            {roomName || '语音房间'}
          </span>
          <span className="text-[10px] text-gray-400 ml-auto">{callDuration}</span>
        </div>
        {currentChannel && (
          <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
            当前: {currentChannel.name} ({channelMembers.length}人)
          </div>
        )}
      </button>
    </div>
  );
}

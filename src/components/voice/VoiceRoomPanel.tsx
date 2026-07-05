'use client';

import { useState, useEffect, useRef } from 'react';
import { useVoiceRoomStore } from '@/store/voiceRoom';
import { useVoiceRoom } from '@/hooks/useVoiceRoom';
import { useUserStore } from '@/store/user';
import VoiceChannelList from './VoiceChannelList';
import VoiceMemberList from './VoiceMemberList';
import VoiceControls from './VoiceControls';

export default function VoiceRoomPanel() {
  const {
    roomId, roomName, isOpen, isMinimized, channels, currentChannelId,
    members, isMicMuted, isSpeakerMuted, isConnecting, connectionError,
    joinedAt, setMinimized, setOpen,
  } = useVoiceRoomStore();

  const user = useUserStore((s) => s.user);
  const { leaveRoom, switchChannel, toggleMic, toggleSpeaker } = useVoiceRoom(user?.id || null);

  const [leaveConfirm, setLeaveConfirm] = useState(false);
  const [callDuration, setCallDuration] = useState('00:00');
  const panelRef = useRef<HTMLDivElement>(null);

  // 从 members 实时计算每个频道的在线人数
  const channelsWithCounts = channels.map((ch) => ({
    ...ch,
    participantCount: members.filter((m) => m.channelId === ch.id).length,
  }));

  // Call duration timer
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

  // Close panel when minimized
  if (!isOpen || !roomId || isMinimized) return null;

  const handleLeave = () => {
    if (leaveConfirm) {
      leaveRoom();
      setLeaveConfirm(false);
    } else {
      setLeaveConfirm(true);
      setTimeout(() => setLeaveConfirm(false), 3000);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[90] bg-black/20 md:hidden"
        onClick={() => setMinimized(true)}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed right-0 top-0 bottom-0 z-[95] w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-slide-in-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
              {roomName || '语音房间'}
            </h2>
            <span className="text-xs text-gray-400 dark:text-gray-500">{callDuration}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMinimized(true)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
              title="最小化"
              aria-label="最小化"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
              title="关闭面板"
              aria-label="关闭面板"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Connection error */}
        {connectionError && (
          <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
            <p className="text-xs text-red-600 dark:text-red-400">{connectionError}</p>
          </div>
        )}

        {/* Connecting state */}
        {isConnecting && (
          <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-blue-600 dark:text-blue-400">正在连接...</p>
            </div>
          </div>
        )}

        {/* Content area */}
        <div className="flex flex-1 min-h-0">
          {/* Channel list - left side */}
          <div className="w-36 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-gray-800/30">
            <VoiceChannelList
              channels={channelsWithCounts}
              currentChannelId={currentChannelId}
              onSwitchChannel={switchChannel}
            />
          </div>

          {/* Member list - right side */}
          <div className="flex-1 flex flex-col">
            <VoiceMemberList
              members={members}
              currentChannelId={currentChannelId}
            />
          </div>
        </div>

        {/* Controls */}
        <VoiceControls
          isMicMuted={isMicMuted}
          isSpeakerMuted={isSpeakerMuted}
          onToggleMic={toggleMic}
          onToggleSpeaker={toggleSpeaker}
          onLeave={handleLeave}
        />

        {/* Leave confirm tooltip */}
        {leaveConfirm && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg">
            再次点击确认离开
          </div>
        )}
      </div>
    </>
  );
}

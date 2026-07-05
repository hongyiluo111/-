'use client';

import type { VoiceChannelInfo } from '@/store/voiceRoom';

interface Props {
  channels: VoiceChannelInfo[];
  currentChannelId: string | null;
  onSwitchChannel: (channelId: string) => void;
}

export default function VoiceChannelList({ channels, currentChannelId, onSwitchChannel }: Props) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-3 py-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 px-1">
          语音频道
        </h3>
        <div className="space-y-0.5">
          {channels
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((channel) => {
              const count = channel.participantCount ?? 0;
              return (
                <button
                  key={channel.id}
                  onClick={() => onSwitchChannel(channel.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${
                    currentChannelId === channel.id
                      ? 'bg-primary/15 text-primary dark:bg-primary/25'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <span className="text-lg">#</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{channel.name}</div>
                    <div className={`text-xs ${
                      count > 0
                        ? 'text-gray-500 dark:text-gray-400'
                        : 'text-gray-400 dark:text-gray-600'
                    }`}>
                      {count > 0 ? `${count}人在线` : '暂无成员'}
                    </div>
                  </div>
                  {currentChannelId === channel.id && (
                    <div className="w-1.5 h-8 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}

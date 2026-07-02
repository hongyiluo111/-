'use client';

import type { VoiceMemberInfo } from '@/store/voiceRoom';
import VoiceStatusIndicator from './VoiceStatusIndicator';

const roleLabels: Record<string, string> = {
  host: '房主',
  speaker: '嘉宾',
  listener: '成员',
};

const roleBadgeColors: Record<string, string> = {
  host: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  speaker: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  listener: '',
};

interface Props {
  members: VoiceMemberInfo[];
  currentChannelId: string | null;
}

export default function VoiceMemberList({ members, currentChannelId }: Props) {
  const channelMembers = members.filter((m) => m.channelId === currentChannelId);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-3 py-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 px-1">
          在线成员 ({channelMembers.length})
        </h3>
        <div className="space-y-0.5">
          {channelMembers.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 px-2 py-4 text-center">
              当前频道暂无成员
            </p>
          ) : (
            channelMembers.map((member) => (
              <div
                key={member.userId}
                className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors ${
                  member.isSpeaking
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600">
                    {member.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5">
                    <VoiceStatusIndicator
                      isSpeaking={member.isSpeaking}
                      isMuted={member.isMuted}
                      size="sm"
                    />
                  </div>
                </div>

                {/* Name + role */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                      {member.name}
                    </span>
                    {member.role !== 'listener' && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${roleBadgeColors[member.role] || ''}`}>
                        {roleLabels[member.role] || member.role}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {member.isMuted ? '已静音' : member.isSpeaking ? '说话中...' : '在线'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

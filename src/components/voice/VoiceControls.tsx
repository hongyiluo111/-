'use client';

interface Props {
  isMicMuted: boolean;
  isSpeakerMuted: boolean;
  onToggleMic: () => void;
  onToggleSpeaker: () => void;
  onLeave: () => void;
}

export default function VoiceControls({
  isMicMuted,
  isSpeakerMuted,
  onToggleMic,
  onToggleSpeaker,
  onLeave,
}: Props) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      {/* Mic toggle */}
      <button
        onClick={onToggleMic}
        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
          isMicMuted
            ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        title={isMicMuted ? '开启麦克风' : '关闭麦克风'}
        aria-label={isMicMuted ? '开启麦克风' : '关闭麦克风'}
      >
        {isMicMuted ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707A1 1 0 0112 5v14a1 1 0 01-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
        <span className="text-[10px]">{isMicMuted ? '开麦' : '静音'}</span>
      </button>

      {/* Speaker toggle */}
      <button
        onClick={onToggleSpeaker}
        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
          isSpeakerMuted
            ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        title={isSpeakerMuted ? '开启扬声器' : '关闭扬声器'}
        aria-label={isSpeakerMuted ? '开启扬声器' : '关闭扬声器'}
      >
        {isSpeakerMuted ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707A1 1 0 0112 5v14a1 1 0 01-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6l-4 4H4v4h4l4 4V6z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.07 4.93a10 10 0 010 14.14" />
          </svg>
        )}
        <span className="text-[10px]">{isSpeakerMuted ? '开声' : '闭麦'}</span>
      </button>

      {/* Leave button */}
      <button
        onClick={onLeave}
        className="flex flex-col items-center gap-1 p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        title="离开房间"
        aria-label="离开房间"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span className="text-[10px]">离开</span>
      </button>
    </div>
  );
}

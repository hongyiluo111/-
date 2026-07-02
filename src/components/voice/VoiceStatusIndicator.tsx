'use client';


export default function VoiceStatusIndicator({
  isSpeaking,
  isMuted,
  size = 'md',
}: {
  isSpeaking: boolean;
  isMuted: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeMap = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5' };
  const ringSize = { sm: 'w-5 h-5', md: 'w-6 h-6', lg: 'w-8 h-8' };

  if (isMuted) {
    return (
      <div className={`${sizeMap[size]} flex items-center justify-center`} title="已静音">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full text-red-400">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707A1 1 0 0112 5v14a1 1 0 01-1.707.707L5.586 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
      </div>
    );
  }

  if (isSpeaking) {
    return (
      <div className="relative flex items-center justify-center" title="说话中">
        <div className={`${ringSize[size]} absolute rounded-full bg-green-400/30 animate-voice-pulse`} />
        <div className={`${sizeMap[size]} rounded-full bg-green-400`} />
      </div>
    );
  }

  return (
    <div className={`${sizeMap[size]} rounded-full bg-green-400/50`} title="在线" />
  );
}

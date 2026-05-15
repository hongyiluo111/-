'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface MessageData {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  duration: number | null;
  revoked: boolean;
  read: boolean;
  timestamp: number;
}

interface MessageBubbleProps {
  message: MessageData;
  isOwn: boolean;
  onRevoke?: (messageId: string) => void;
  onImageClick?: (url: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function MessageBubble({ message, isOwn, onRevoke, onImageClick }: MessageBubbleProps) {
  const [playing, setPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canRevoke = isOwn && !message.revoked && Date.now() - message.timestamp < 2 * 60 * 1000;

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  if (message.revoked) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
        <div className="px-4 py-2 rounded-2xl bg-gray-100 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 text-sm italic">
          {isOwn ? '你撤回了一条消息' : '对方撤回了一条消息'}
        </div>
      </div>
    );
  }

  const handlePlayVoice = () => {
    if (!message.fileUrl) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlaying(false);
      setAudioProgress(0);
      return;
    }
    const audio = new Audio(message.fileUrl);
    audioRef.current = audio;
    audio.onplay = () => setPlaying(true);
    audio.onended = () => { setPlaying(false); setAudioProgress(0); audioRef.current = null; };
    audio.ontimeupdate = () => {
      if (audio.duration) setAudioProgress(audio.currentTime / audio.duration);
    };
    audio.play();
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3 group`}>
      <div className="relative max-w-[75%]">
        {message.type === 'text' && (
          <div className={`px-4 py-2.5 rounded-2xl break-words whitespace-pre-wrap text-sm leading-relaxed ${
            isOwn
              ? 'bg-primary text-white rounded-br-md'
              : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-md shadow-sm'
          }`}>
            {message.content}
          </div>
        )}

        {message.type === 'image' && message.fileUrl && (
          <div
            className="rounded-2xl overflow-hidden cursor-pointer shadow-sm"
            onClick={() => onImageClick?.(message.fileUrl!)}
          >
            <Image
              src={message.fileUrl}
              alt={message.content || '图片'}
              width={240}
              height={180}
              className="max-w-[240px] max-h-[180px] object-cover"
              unoptimized
            />
          </div>
        )}

        {message.type === 'file' && message.fileUrl && (
          <a
            href={message.fileUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-sm ${
              isOwn
                ? 'bg-primary/90 text-white rounded-br-md'
                : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-md'
            }`}
          >
            <svg className="w-8 h-8 shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{message.fileName || message.content}</p>
              {message.fileSize && <p className="text-xs opacity-60">{formatFileSize(message.fileSize)}</p>}
            </div>
          </a>
        )}

        {message.type === 'voice' && message.fileUrl && (
          <button
            onClick={handlePlayVoice}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl min-w-[140px] ${
              isOwn
                ? 'bg-primary/90 text-white rounded-br-md'
                : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-md shadow-sm'
            }`}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {playing
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              }
            </svg>
            <div className="flex-1 h-1 rounded-full bg-current opacity-20 overflow-hidden">
              <div className="h-full bg-current opacity-60 rounded-full transition-all" style={{ width: `${audioProgress * 100}%` }} />
            </div>
            <span className="text-xs opacity-70">{message.duration ? formatDuration(message.duration) : '0:00'}</span>
          </button>
        )}

        <div className={`flex items-center gap-2 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isOwn && message.read && (
            <span className="text-[10px] text-primary">已读</span>
          )}
          {canRevoke && (
            <button
              onClick={() => onRevoke?.(message.id)}
              className="text-[10px] text-gray-400 hover:text-red-500 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
            >
              撤回
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

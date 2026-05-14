'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface VoiceRecorderProps {
  onSend: (fileUrl: string, duration: number) => void;
  onCancel: () => void;
  onShortRecording?: () => void;
}

export default function VoiceRecorder({ onSend, onCancel, onShortRecording }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [uploading, setUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });

      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);

        if (elapsed < 1) {
          setRecording(false);
          setDuration(0);
          onShortRecording?.();
          return;
        }

        setUploading(true);
        try {
          const formData = new FormData();
          formData.append('file', blob, `voice-${Date.now()}.webm`);

          const res = await fetch('/api/chat/upload', {
            method: 'POST',
            credentials: 'include',
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            onSend(data.url, elapsed);
          }
        } catch { /* ignore */ } finally {
          setUploading(false);
          setRecording(false);
          setDuration(0);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      startTimeRef.current = Date.now();
      setRecording(true);
      setDuration(0);
      mediaRecorder.start(1000);

      timerRef.current = setInterval(() => {
        setDuration(Math.round((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } catch {
      onCancel();
    }
  }, [onSend, onCancel]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const cancelRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setRecording(false);
    setDuration(0);
    onCancel();
  }, [onCancel]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (uploading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-sm text-gray-500">上传中...</span>
      </div>
    );
  }

  if (!recording) {
    return (
      <button
        onClick={startRecording}
        className="flex items-center justify-center h-8 w-8 rounded-full text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors"
        title="语音消息"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
      <div className="flex items-center gap-1">
        <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
        <span className="text-sm font-mono text-red-600 dark:text-red-400">{formatTime(duration)}</span>
      </div>

      <div className="flex-1 flex items-center gap-1">
        {Array.from({ length: Math.min(duration, 20) }).map((_, i) => (
          <div
            key={i}
            className="w-1 rounded-full bg-red-400 animate-pulse"
            style={{ height: `${8 + Math.random() * 16}px`, animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>

      <button
        onClick={cancelRecording}
        className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1"
      >
        取消
      </button>

      <button
        onClick={stopRecording}
        className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs text-white hover:bg-primary/90 transition-colors"
      >
        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
        </svg>
        发送
      </button>
    </div>
  );
}

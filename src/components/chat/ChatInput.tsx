'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import EmojiPicker from '@/components/EmojiPicker';
import VoiceRecorder, { isVoiceSupported } from '@/components/VoiceRecorder';
import { useToast } from '@/components/Toast';

interface ChatInputProps {
  onSend: (data: { content: string; type: string; fileUrl?: string; fileName?: string; fileSize?: number; duration?: number }) => void;
  onTyping: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({ onSend, onTyping, disabled, placeholder = '输入消息...' }: ChatInputProps) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastTypingRef = useRef(0);
  const { showToast } = useToast();

  useEffect(() => {
    setVoiceSupported(isVoiceSupported());
  }, []);

  const handleTextChange = (value: string) => {
    setText(value);
    const now = Date.now();
    if (now - lastTypingRef.current > 3000) {
      lastTypingRef.current = now;
      onTyping();
    }
  };

  const handleSendText = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend({ content: trimmed, type: 'text' });
    setText('');
    setShowEmoji(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 128) + 'px';
  };

  const handleEmojiSelect = (emoji: string) => {
    setText((prev) => prev + emoji);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/chat/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const isImage = file.type.startsWith('image/');
        onSend({
          content: isImage ? '图片' : file.name,
          type: isImage ? 'image' : 'file',
          fileUrl: data.url,
          fileName: data.fileName,
          fileSize: data.fileSize,
        });
      } else {
        showToast('error', '文件上传失败');
      }
    } catch {
      showToast('error', '文件上传失败');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleVoiceSend = useCallback((fileUrl: string, duration: number) => {
    onSend({ content: '语音消息', type: 'voice', fileUrl, duration });
    setShowVoice(false);
  }, [onSend]);

  const handleVoiceCancel = useCallback(() => {
    setShowVoice(false);
  }, []);

  if (showVoice) {
    return (
      <div className="border-t border-gray-100 dark:border-gray-700 p-3">
        <VoiceRecorder onSend={handleVoiceSend} onCancel={handleVoiceCancel} />
      </div>
    );
  }

  return (
    <div className="border-t border-gray-100 dark:border-gray-700 p-3">
      <div className="flex items-end gap-2">
        <div className="relative">
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className="flex items-center justify-center h-9 w-9 rounded-full text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors"
            title="表情"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          {showEmoji && (
            <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmoji(false)} />
          )}
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center justify-center h-9 w-9 rounded-full text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
          title="图片/文件"
        >
          {uploading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*,audio/*" className="hidden" onChange={handleFileUpload} />

        {voiceSupported && (
          <button
            onClick={() => setShowVoice(true)}
            className="flex items-center justify-center h-9 w-9 rounded-full text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors"
            title="语音消息"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
        )}

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => { handleTextChange(e.target.value); autoResize(e.target); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendText();
              }
            }}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:opacity-50 resize-none max-h-32 overflow-y-auto"
          />
        </div>

        <button
          onClick={handleSendText}
          disabled={disabled || !text.trim()}
          className="flex items-center justify-center h-9 w-9 rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}

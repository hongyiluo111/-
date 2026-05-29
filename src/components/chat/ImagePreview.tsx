'use client';

import Image from 'next/image';

interface ImagePreviewProps {
  url: string;
  onClose: () => void;
}

export default function ImagePreview({ url, onClose }: ImagePreviewProps) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors"
          aria-label="关闭预览"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <Image
          src={url}
          alt="预览"
          width={800}
          height={600}
          className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
          unoptimized
        />
      </div>
    </div>
  );
}

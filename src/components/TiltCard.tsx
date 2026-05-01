'use client';

import { useRef, useState, useCallback, forwardRef, type ReactNode, type MouseEvent } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useIsDesktop } from '@/hooks/useIsDesktop';

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  maxTilt?: number;     // 最大倾斜角度 (deg)，默认 6
  scale?: number;       // 悬停时缩放比例，默认 1.02
  glare?: boolean;      // 是否显示光泽效果，默认 true
}

/**
 * 3D 倾斜卡片 — 鼠标悬停时随光标轻倾斜
 * 仅桌面端生效，且尊重 prefers-reduced-motion
 */
const TiltCard = forwardRef<HTMLDivElement, TiltCardProps>(function TiltCard({
  children,
  className = '',
  maxTilt = 6,
  scale = 1.02,
  glare = true,
  ...rest
}, forwardedRef) {
  const innerRef = useRef<HTMLDivElement>(null);
  // 合并内部 ref 与外部 forwardedRef
  const setRefs = useCallback((node: HTMLDivElement | null) => {
    (innerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  }, [forwardedRef]);
  const [transform, setTransform] = useState('');
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const prefersReduced = useReducedMotion();
  const isDesktop = useIsDesktop();

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (prefersReduced || !isDesktop) return;
      const el = innerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const tiltX = (maxTilt * 2) * (0.5 - y);  // 上下 → rotateX
      const tiltY = (maxTilt * 2) * (x - 0.5);  // 左右 → rotateY

      setTransform(
        `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${scale}, ${scale}, 1)`,
      );

      if (glare) {
        setGlareStyle({
          opacity: '0.12',
          background: `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.35), transparent 60%)`,
        });
      }
    },
    [prefersReduced, isDesktop, maxTilt, scale, glare],
  );

  const handleMouseLeave = useCallback(() => {
    setTransform('');
    setGlareStyle({ opacity: 0 });
  }, []);

  const transitionStyle = !prefersReduced
    ? {
        transform: transform || 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)',
        transition: transform
          ? 'transform 0.12s ease-out'
          : 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
      }
    : undefined;

  return (
    <div
      ref={setRefs}
      className={`${className} ${!prefersReduced ? 'tilt-card' : ''}`}
      style={transitionStyle}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      {children}
      {glare && !prefersReduced && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
          style={glareStyle}
        />
      )}
    </div>
  );
});

TiltCard.displayName = 'TiltCard';

export default TiltCard;

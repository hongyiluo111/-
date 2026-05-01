'use client';

import { useRef, useState, useCallback, forwardRef, type ReactNode, type MouseEvent } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useIsDesktop } from '@/hooks/useIsDesktop';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  strength?: number;   // 磁性强度 (px)，默认 12
  radius?: number;     // 磁性感应半径 (px)，默认 120
  as?: 'button' | 'a'; // 渲染标签
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
}

/**
 * 磁性按钮 — 鼠标靠近时按钮轻微跟随光标偏移
 * 仅桌面端生效，且尊重 prefers-reduced-motion
 */
const MagneticButton = forwardRef<HTMLElement, MagneticButtonProps>(function MagneticButton({
  children,
  className = '',
  style: externalStyle,
  strength = 12,
  radius = 120,
  as = 'button',
  href,
  onClick,
  disabled,
}, forwardedRef) {
  const innerRef = useRef<HTMLElement>(null);
  // 合并内部 ref 与外部 forwardedRef
  const setRefs = useCallback((node: HTMLElement | null) => {
    (innerRef as React.MutableRefObject<HTMLElement | null>).current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  }, [forwardedRef]);

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [pressing, setPressing] = useState(false);
  const prefersReduced = useReducedMotion();
  const isDesktop = useIsDesktop();

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (prefersReduced || !isDesktop) return;
      const el = innerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius) {
        // 防止 dist=0 时 dx/dist 产生 NaN
        if (dist === 0) {
          setOffset({ x: 0, y: 0 });
        } else {
          const factor = (1 - dist / radius) * strength;
          setOffset({ x: (dx / dist) * factor, y: (dy / dist) * factor });
        }
      } else {
        setOffset({ x: 0, y: 0 });
      }
    },
    [prefersReduced, isDesktop, strength, radius],
  );

  const handleMouseLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 });
  }, []);

  const handlePointerDown = useCallback(() => {
    if (!disabled) setPressing(true);
  }, [disabled]);

  const handlePointerUp = useCallback(() => {
    setPressing(false);
  }, []);

  // 合并磁性偏移 + 按压缩放
  const scaleValue = pressing && !disabled ? 'scale(0.97)' : '';
  const magneticStyle = !prefersReduced
    ? {
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0) ${scaleValue}`,
        transition: offset.x === 0 && offset.y === 0
          ? 'transform 0.45s cubic-bezier(0.23, 1, 0.32, 1)'
          : 'transform 0.15s ease-out',
      }
    : undefined;
  const style = externalStyle ? { ...externalStyle, ...magneticStyle } : magneticStyle;

  const Tag = as;

  return (
    <Tag
      ref={setRefs}
      className={`${className} ${!prefersReduced ? 'magnetic-btn' : ''}`}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={onClick}
      disabled={as === 'button' ? disabled : undefined}
      aria-disabled={as === 'a' && disabled ? true : undefined}
      href={as === 'a' ? href : undefined}
    >
      {children}
    </Tag>
  );
});

MagneticButton.displayName = 'MagneticButton';

export default MagneticButton;

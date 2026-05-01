'use client';

import { useEffect, useState, useRef } from 'react';
import { useInView } from '@/hooks/useInView';

interface CountUpProps {
  end: number;
  duration?: number;
  className?: string;
}

export default function CountUp({ end, duration = 1200, className = '' }: CountUpProps) {
  const { ref, isVisible } = useInView(0.3);
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!isVisible) return;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * end));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [isVisible, end, duration]);

  return (
    <span ref={ref} className={className}>
      {isVisible ? value : 0}
    </span>
  );
}

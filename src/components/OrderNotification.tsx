'use client';

import { useEffect } from 'react';
import { getPusher, releasePusher } from '@/lib/pusher';
import { useToast } from './Toast';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: Date;
}

export default function OrderNotification() {
  const { showToast } = useToast();

  useEffect(() => {
    let pusher: ReturnType<typeof getPusher>;
    try {
      pusher = getPusher();
    } catch { return; }

    const channel = pusher.subscribe('order-notifications');

    channel.bind('new-order', (data: Notification) => {
      showToast('warning', `${data.title}: ${data.message}`);
    });

    return () => {
      pusher.unsubscribe('order-notifications');
      releasePusher();
    };
  }, [showToast]);

  return null;
}

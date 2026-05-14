'use client';

import { useEffect } from 'react';
import Pusher from 'pusher-js';
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
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!key || !cluster) return;

    let pusher: Pusher;
    try {
      pusher = new Pusher(key, { cluster });
    } catch {
      console.error('Pusher 初始化失败');
      return;
    }

    const channel = pusher.subscribe('order-notifications');

    channel.bind('new-order', (data: Notification) => {
      showToast('warning', `${data.title}: ${data.message}`);
    });

    return () => {
      pusher.unsubscribe('order-notifications');
      pusher.disconnect();
    };
  }, [showToast]);

  return null;
}

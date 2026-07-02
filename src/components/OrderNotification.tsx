'use client';

import { useEffect } from 'react';
import { getPusher, releasePusher } from '@/lib/pusher';
import { useToast } from './Toast';
import { useUserStore } from '@/store/user';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: Date;
}

export default function OrderNotification() {
  const { showToast } = useToast();
  const user = useUserStore((s) => s.user);

  useEffect(() => {
    // 未登录时不订阅
    if (!user?.id) return;

    let pusher: ReturnType<typeof getPusher>;
    try {
      pusher = getPusher();
    } catch { return; }

    // 订阅用户私有通知频道，只接收发给自己的事件
    const channelName = `private-user-notifications-${user.id}`;
    const channel = pusher.subscribe(channelName);

    channel.bind('new-order', (data: Notification) => {
      showToast('warning', `${data.title}: ${data.message}`);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      releasePusher();
    };
    // showToast 由 useCallback([]) 稳定，无需放入依赖
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return null;
}

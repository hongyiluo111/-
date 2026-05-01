'use client';

import { useState, useEffect } from 'react';
import Pusher from 'pusher-js';

interface OrderData {
  order_id: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: OrderData;
  createdAt: Date;
}

export default function OrderNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

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
      setNotifications((prev) => [data, ...prev]);
    });

    return () => {
      pusher.unsubscribe('order-notifications');
      pusher.disconnect();
    };
  }, []);

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <h3 className="mt-0 mb-4 text-base font-semibold">订单通知</h3>
      {notifications.length === 0 ? (
        <p className="text-gray-500">暂无通知</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div key={notification.id} className="p-3 bg-white border border-gray-200 rounded-lg mb-3">
              <div className="font-semibold mb-1">{notification.title}</div>
              <div className="text-gray-600 mb-2">{notification.message}</div>
              <div className="text-xs text-gray-500">
                {new Date(notification.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

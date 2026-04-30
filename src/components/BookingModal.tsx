'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Companion {
  id: number;
  name: string;
  game: string;
  rank: string;
  price: number;
  avatar: string;
  description: string;
}

interface BookingModalProps {
  companion: Companion;
  onClose: () => void;
}

const durationOptions = [
  { value: 1, label: '1小时' },
  { value: 2, label: '2小时' },
  { value: 3, label: '3小时' },
  { value: 5, label: '5小时' },
  { value: 10, label: '10小时' },
];

export default function BookingModal({ companion, onClose }: BookingModalProps) {
  const router = useRouter();
  const [duration, setDuration] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const totalPrice = companion.price * duration;

  const handleBooking = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companionId: companion.id,
          companionName: companion.name,
          companionAvatar: companion.avatar,
          game: companion.game,
          rank: companion.rank,
          price: totalPrice,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || '预约失败，请稍后重试');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/orders');
      }, 1200);
    } catch {
      setError('网络错误，请检查网络后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white">
        <div className="bg-gradient-to-r from-primary to-accent p-6 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">预约陪玩</h3>
            <button onClick={onClose} className="text-2xl text-white hover:text-gray-200">
              ×
            </button>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
              <Image
                src={companion.avatar}
                alt={companion.name}
                width={56}
                height={56}
                sizes="56px"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h4 className="text-lg font-semibold">{companion.name}</h4>
              <p className="text-sm text-gray-500">
                {companion.game} · {companion.rank}
              </p>
            </div>
          </div>

          <div>
            <label className="mb-3 block font-medium text-gray-700">选择时长</label>
            <div className="grid grid-cols-3 gap-2">
              {durationOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDuration(option.value)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    duration === option.value
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-blue-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">单价</span>
              <span className="font-medium">￥{companion.price}/小时</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-blue-100 pt-2">
              <span className="text-gray-600">总计</span>
              <span className="text-xl font-bold text-primary">￥{totalPrice}</span>
            </div>
          </div>

          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

          {success && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">预约成功，正在跳转到订单页...</div>}

          <button
            onClick={handleBooking}
            disabled={loading || success}
            className="w-full rounded-xl bg-gradient-to-r from-primary to-accent py-3 font-medium text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? '提交中...' : success ? '预约成功' : `确认预约 ￥${totalPrice}`}
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  content: string | null;
  createdAt: string;
}

export default function CompanionReviewsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/companion/reviews');
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      if (response.status === 404) {
        router.push('/become-companion');
        return;
      }
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '获取评价失败');
      }
      setReviews(data.reviews);
      setAverageRating(data.averageRating);
      setTotalReviews(data.totalReviews);
    } catch (err) {
      console.error('获取评价失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    const stars = [];
    const sizeClass = size === 'lg' ? 'text-2xl' : 'text-sm';
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`${sizeClass} ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>
          ★
        </span>
      );
    }
    return <div className="flex gap-0.5">{stars}</div>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="bg-gradient-to-r from-primary to-accent text-white py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <h1 className="text-3xl font-bold">我的评价</h1>
            <p className="mt-2 opacity-90">查看用户对你的评价</p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="card animate-pulse mb-6">
              <div className="flex items-center justify-center gap-4">
                <div className="h-16 w-16 bg-gray-200 rounded"></div>
                <div>
                  <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-gradient-to-r from-primary to-accent text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">我的评价</h1>
          <p className="mt-2 opacity-90">查看用户对你的评价</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="card mb-6 text-center">
            <div className="flex items-center justify-center gap-4">
              <div className="text-5xl font-bold text-primary">{averageRating.toFixed(1)}</div>
              <div>
                {renderStars(Math.round(averageRating), 'lg')}
                <p className="text-gray-500 mt-1">共 {totalReviews} 条评价</p>
              </div>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">暂无评价</h3>
              <p className="text-gray-500">完成更多订单后，用户评价将会显示在这里</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {review.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{review.userName}</p>
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-500">{review.rating}.0</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">{formatDate(review.createdAt)}</span>
                  </div>
                  {review.content && (
                    <p className="text-gray-600 pl-13">{review.content}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

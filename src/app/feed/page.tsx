'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUserStore } from '@/store/user';

interface Post {
  id: string;
  userId: string;
  content: string;
  images: string[] | null;
  game: string | null;
  type: string;
  likes: number;
  comments: number;
  createdAt: string;
  userName: string;
  userAvatar: string | null;
  userRole: string;
}

const GAMES = [
  '三角洲行动',
  '王者荣耀',
  '英雄联盟',
  '和平精英',
  'CS2',
  '无畏契约',
  '金铲铲之战',
  '穿越火线',
];

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  if (days < 30) return `${Math.floor(days / 7)}周前`;
  return date.toLocaleDateString('zh-CN');
}

export default function FeedPage() {
  const { user } = useUserStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [content, setContent] = useState('');
  const [game, setGame] = useState('');
  const [publishing, setPublishing] = useState(false);

  const fetchPosts = useCallback(async (pageNum: number, gameFilter?: string) => {
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
      });
      if (gameFilter) {
        params.set('game', gameFilter);
      }

      const res = await fetch(`/api/feed?${params.toString()}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (pageNum === 1) {
          setPosts(data.posts);
        } else {
          setPosts((prev) => [...prev, ...data.posts]);
        }
        setTotal(data.total);
        setHasMore(pageNum * 20 < data.total);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchPosts(1, selectedGame || undefined);
  }, [selectedGame, fetchPosts]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, selectedGame || undefined);
  };

  const handlePublish = async () => {
    if (!content.trim() || publishing) return;
    setPublishing(true);

    try {
      const res = await fetch('/api/feed/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: content.trim(),
          game: game || undefined,
        }),
      });

      if (res.ok) {
        setContent('');
        setGame('');
        setLoading(true);
        setPage(1);
        setSelectedGame('');
        fetchPosts(1);
      }
    } catch { /* ignore */ }
    setPublishing(false);
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await fetch(`/api/feed/${postId}/like`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, likes: data.likes } : p
          )
        );
      }
    } catch { /* ignore */ }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] pt-20 pb-12">
      <div className="bg-gradient-to-br from-primary via-[#1f7dd6] to-accent text-white py-14 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold">动态广场</h1>
          <p className="mt-3 max-w-2xl text-white/90">
            分享你的游戏时刻，与社区互动交流
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
        {user && (
          <div className="rounded-2xl border border-white/90 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              发布动态
            </h2>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="分享你的游戏心得..."
              rows={3}
              className="input w-full mb-3 resize-none"
            />
            <div className="flex items-center gap-3">
              <select
                value={game}
                onChange={(e) => setGame(e.target.value)}
                className="input flex-grow"
              >
                <option value="">选择游戏（可选）</option>
                {GAMES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <button
                onClick={handlePublish}
                disabled={!content.trim() || publishing}
                className="btn btn-primary"
              >
                {publishing ? '发布中...' : '发布'}
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedGame('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedGame === ''
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            全部
          </button>
          {GAMES.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGame(g)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedGame === g
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/90 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 p-6 shadow-lg animate-pulse"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-600 rounded"></div>
                    <div className="h-3 w-16 bg-gray-200 dark:bg-gray-600 rounded"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded"></div>
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-white/90 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 p-12 shadow-lg text-center">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              还没有动态，快来发布第一条吧！
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="card rounded-2xl border border-white/90 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 p-6 shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Link href={`/profile/${post.userId}`}>
                      {post.userAvatar ? (
                        <Image
                          src={post.userAvatar}
                          alt={post.userName}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {post.userName.charAt(0)}
                        </div>
                      )}
                    </Link>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/profile/${post.userId}`}
                          className="font-medium text-gray-800 dark:text-gray-100 hover:text-primary transition-colors"
                        >
                          {post.userName}
                        </Link>
                        {post.userRole === 'companion' && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                            陪玩
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {getRelativeTime(post.createdAt)}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap mb-4">
                    {post.content}
                  </p>

                  {post.game && (
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                        🎮 {post.game}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <span className="text-sm">{post.likes}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="text-center">
                <button
                  onClick={handleLoadMore}
                  className="btn btn-outline"
                >
                  加载更多
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user';
import ChatModal from '@/components/ChatModal';

interface Friend {
  id: string;
  userId: string;
  name: string;
}

interface FriendRequest {
  id: string;
  userId: string;
  name: string;
}

export default function FriendsPage() {
  const { user } = useUserStore();
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState<{ id: string; name: string } | null>(null);
  const [searchError, setSearchError] = useState('');
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [activeChat, setActiveChat] = useState<{ userId: string; userName: string } | null>(null);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/friends', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setFriends(data.friends || []);
        setRequests(data.requests || []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    loadData();
  }, [user, router, loadData]);

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;
    setSearchError('');
    setSearchResult(null);
    try {
      const res = await fetch(`/api/friends/search?email=${encodeURIComponent(searchEmail.trim())}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setSearchResult(data.user);
        } else {
          setSearchError('未找到该用户');
        }
      }
    } catch {
      setSearchError('搜索失败');
    }
  };

  const handleAddFriend = async () => {
    if (!searchResult) return;
    setAddError('');
    setAddSuccess('');
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ friendId: searchResult.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setAddSuccess('好友请求已发送');
        setSearchResult(null);
        setSearchEmail('');
      } else {
        setAddError(data.error || '添加失败');
      }
    } catch {
      setAddError('网络错误');
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      const res = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ requestId }),
      });
      if (res.ok) loadData();
    } catch { /* ignore */ }
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="bg-gradient-to-br from-primary via-[#1f7dd6] to-accent text-white py-14 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">好友</h1>
          <p className="mt-3 max-w-2xl text-white/90">管理好友、处理申请。</p>
        </div>
      </div>

      <div className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
        {/* 添加好友 */}
        <div className="rounded-2xl border border-white/90 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">添加好友</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="搜索用户邮箱..."
              className="input flex-grow"
            />
            <button onClick={handleSearch} className="btn btn-primary">搜索</button>
          </div>
          {searchError && <p className="mt-2 text-sm text-red-500">{searchError}</p>}
          {addError && <p className="mt-2 text-sm text-red-500">{addError}</p>}
          {addSuccess && <p className="mt-2 text-sm text-green-500">{addSuccess}</p>}
          {searchResult && (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-gray-50 dark:bg-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {searchResult.name.charAt(0)}
                </div>
                <span className="font-medium text-gray-800 dark:text-gray-100">{searchResult.name}</span>
              </div>
              <button onClick={handleAddFriend} className="btn btn-primary text-sm">添加好友</button>
            </div>
          )}
        </div>

        {/* 好友请求 */}
        {requests.length > 0 && (
          <div className="rounded-2xl border border-white/90 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">好友请求</h2>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {requests.map((req) => (
                <div key={req.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {req.name.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-800 dark:text-gray-100">{req.name}</span>
                  </div>
                  <button onClick={() => handleAccept(req.id)} className="btn btn-primary text-sm">接受</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 好友列表 */}
        <div className="rounded-2xl border border-white/90 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">我的好友 ({friends.length})</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          ) : friends.length === 0 ? (
            <p className="text-center text-gray-400 dark:text-gray-500 py-8">暂无好友，快去添加吧！</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {friends.map((f) => (
                <div
                  key={f.id}
                  onClick={() => setActiveChat({ userId: f.userId, userName: f.name })}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {f.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-800 dark:text-gray-100">{f.name}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">点击聊天</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {activeChat && (
        <ChatModal
          receiverId={activeChat.userId}
          receiverName={activeChat.userName}
          onClose={() => setActiveChat(null)}
        />
      )}
    </div>
  );
}

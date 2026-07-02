'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useUserStore } from '@/store/user';
import { getGameColor } from '@/data/gameColors';

const GAMES = ['三角洲行动', '王者荣耀', '英雄联盟', '和平精英', 'CS2', '无畏契约', '金铲铲之战', '穿越火线', '原神', 'DOTA2', '永劫无间', 'CSGO'];

interface ClubData {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  banner: string | null;
  gameId: string;
  ownerId: string;
  memberCount: number;
  status: string;
  createdAt: string;
}

interface Member {
  id: string;
  clubId: string;
  userId: string;
  role: string;
  joinedAt: string;
  user: { id: string; name: string; email: string; avatar: string | null; role: string };
}

interface Announcement {
  id: string;
  clubId: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
}

type Tab = 'overview' | 'members' | 'edit' | 'announcements';

const tabLabels: Record<Tab, string> = {
  overview: '概览',
  members: '成员管理',
  edit: '编辑资料',
  announcements: '公告',
};

export default function ClubManageDetailPage() {
  const params = useParams();
    const { user, setUser } = useUserStore();
  const id = params.id as string;

  const [club, setClub] = useState<ClubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');

  // Members state
  const [members, setMembers] = useState<Member[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberLoading, setMemberLoading] = useState(false);

  // Edit state
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editGame, setEditGame] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editMsg, setEditMsg] = useState('');

  // Announcement state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annLoading, setAnnLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      fetch('/api/auth/current-user').then(r => r.ok ? r.json() : null).then(d => { if (d) setUser(d); }).catch(() => {});
    }
  }, [setUser, user]);

  // Fetch club
  useEffect(() => {
    fetch(`/api/clubs/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.club) {
          setClub(data.club);
          setEditName(data.club.name);
          setEditDesc(data.club.description || '');
          setEditGame(data.club.gameId);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  // Permission check
  const isOwner = user && club && user.id === club.ownerId;
  const isAdmin = user?.role === 'admin';
  const canManage = isOwner || isAdmin;

  // Fetch members
  const fetchMembers = useCallback(async () => {
    setMemberLoading(true);
    try {
      const url = memberSearch
        ? `/api/clubs/${id}/manage/members?search=${encodeURIComponent(memberSearch)}`
        : `/api/clubs/${id}/manage/members`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    } catch {}
    setMemberLoading(false);
  }, [id, memberSearch]);

  useEffect(() => {
    if (tab === 'members' && canManage) fetchMembers();
  }, [tab, canManage, fetchMembers]);

  // Fetch announcements
  useEffect(() => {
    if (tab === 'announcements' && canManage) {
      fetch(`/api/clubs/${id}/manage/announcements`)
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setAnnouncements(data.announcements || []); })
        .catch(() => {});
    }
  }, [tab, id, canManage]);

  // Handlers
  const handleRoleChange = async (userId: string, newRole: string) => {
    await fetch(`/api/clubs/${id}/manage/members/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });
    fetchMembers();
  };

  const handleKick = async (userId: string, name: string) => {
    if (!window.confirm(`确定要将 ${name} 踢出俱乐部吗？`)) return;
    await fetch(`/api/clubs/${id}/manage/members/${userId}`, { method: 'DELETE' });
    fetchMembers();
    setClub(prev => prev ? { ...prev, memberCount: prev.memberCount - 1 } : prev);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditMsg('');
    try {
      const res = await fetch(`/api/clubs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, description: editDesc, gameId: editGame }),
      });
      if (res.ok) {
        const data = await res.json();
        setClub(data.club);
        setEditMsg('保存成功');
      } else {
        const data = await res.json();
        setEditMsg(data.error || '保存失败');
      }
    } catch {
      setEditMsg('网络错误');
    }
    setEditLoading(false);
    setTimeout(() => setEditMsg(''), 3000);
  };

  const handlePublishAnn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;
    setAnnLoading(true);
    try {
      const res = await fetch(`/api/clubs/${id}/manage/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: annTitle, content: annContent }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(prev => [data.announcement, ...prev]);
        setAnnTitle('');
        setAnnContent('');
      }
    } catch {}
    setAnnLoading(false);
  };

  const handleDeleteAnn = async (annId: string) => {
    if (!window.confirm('确定要删除这条公告吗？')) return;
    await fetch(`/api/clubs/${id}/manage/announcements/${annId}`, { method: 'DELETE' });
    setAnnouncements(prev => prev.filter(a => a.id !== annId));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-7xl mb-6">🏕️</div>
        <h1 className="text-2xl font-bold mb-2">俱乐部不存在</h1>
        <Link href="/clubs/manage" className="btn btn-primary mt-4">返回管理</Link>
      </div>
    );
  }

  if (!user || !canManage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-7xl mb-6">⛔</div>
        <h1 className="text-2xl font-bold mb-2">无权限</h1>
        <Link href="/clubs/manage" className="btn btn-primary mt-4">返回管理</Link>
      </div>
    );
  }

  const gameColor = getGameColor(club.gameId);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className={`relative h-40 bg-gradient-to-r ${gameColor}`}>
        {club.banner && <Image src={club.banner} alt={club.name} fill sizes="100vw" className="object-cover" />}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex items-center px-4">
          <div className="container mx-auto max-w-6xl flex items-center gap-4">
            <Link href="/clubs/manage" className="text-white/80 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="h-14 w-14 rounded-full overflow-hidden bg-gray-200 ring-2 ring-white shadow">
              {club.avatar ? (
                <Image src={club.avatar} alt={club.name} width={56} height={56} sizes="56px" className="h-full w-full object-cover" />
              ) : (
                <div className={`flex h-full w-full items-center justify-center text-xl font-bold text-white bg-gradient-to-r ${gameColor}`}>
                  {club.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{club.name}</h1>
              <p className="text-sm text-white/80">{club.gameId} · {club.memberCount} 名成员</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex gap-1 overflow-x-auto">
            {(Object.keys(tabLabels) as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  tab === t
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tabLabels[t]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Overview Tab */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">成员总数</h3>
              <p className="text-3xl font-bold text-primary">{club.memberCount}</p>
            </div>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">游戏类型</h3>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{club.gameId}</p>
            </div>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">创建时间</h3>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {new Date(club.createdAt).toLocaleDateString('zh-CN')}
              </p>
            </div>
            <div className="card md:col-span-3">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">俱乐部简介</h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{club.description || '暂无简介'}</p>
            </div>
            <div className="md:col-span-3 flex gap-3">
              <Link href={`/clubs/${club.id}`} className="btn btn-secondary">查看详情页</Link>
              <Link href={`/clubs/${club.id}`} className="btn btn-primary">进入语音大厅</Link>
            </div>
          </div>
        )}

        {/* Members Tab */}
        {tab === 'members' && (
          <div>
            <div className="mb-6 flex items-center gap-3">
              <input
                type="text"
                placeholder="搜索成员..."
                value={memberSearch}
                onChange={e => setMemberSearch(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') fetchMembers(); }}
                className="input max-w-xs"
              />
              <button onClick={fetchMembers} className="btn btn-secondary">搜索</button>
            </div>

            {memberLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary" />
              </div>
            ) : members.length === 0 ? (
              <div className="empty-state py-8">暂无成员</div>
            ) : (
              <div className="space-y-2">
                {members.map(m => (
                  <div key={m.id} className="card flex items-center gap-4 py-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 shrink-0">
                      {m.user.avatar ? (
                        <Image src={m.user.avatar} alt={m.user.name} width={40} height={40} sizes="40px" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-500">
                          {m.user.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800 dark:text-gray-100 truncate">{m.user.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          m.role === 'owner' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          : m.role === 'admin' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}>
                          {m.role === 'owner' ? '部长' : m.role === 'admin' ? '管理员' : '成员'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {m.user.email} · 加入于 {new Date(m.joinedAt).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                    {m.role !== 'owner' && (
                      <div className="flex items-center gap-2 shrink-0">
                        {m.role === 'admin' ? (
                          <button
                            onClick={() => handleRoleChange(m.userId, 'member')}
                            className="text-xs px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            取消管理员
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRoleChange(m.userId, 'admin')}
                            className="text-xs px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                          >
                            设为管理员
                          </button>
                        )}
                        <button
                          onClick={() => handleKick(m.userId, m.user.name)}
                          className="text-xs px-3 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                        >
                          踢出
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Edit Tab */}
        {tab === 'edit' && (
          <form onSubmit={handleEdit} className="max-w-2xl space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">俱乐部名称</label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">游戏类型</label>
              <select value={editGame} onChange={e => setEditGame(e.target.value)} className="select" required>
                {GAMES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">俱乐部简介</label>
              <textarea
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                className="input min-h-[120px] resize-y"
                placeholder="介绍一下你的俱乐部..."
              />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={editLoading} className="btn btn-primary">
                {editLoading ? '保存中...' : '保存修改'}
              </button>
              {editMsg && (
                <span className={`text-sm ${editMsg.includes('成功') ? 'text-green-500' : 'text-red-500'}`}>
                  {editMsg}
                </span>
              )}
            </div>
          </form>
        )}

        {/* Announcements Tab */}
        {tab === 'announcements' && (
          <div className="max-w-2xl">
            {/* Publish form */}
            <form onSubmit={handlePublishAnn} className="card mb-8">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">发布公告</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="公告标题"
                  value={annTitle}
                  onChange={e => setAnnTitle(e.target.value)}
                  className="input"
                  required
                />
                <textarea
                  placeholder="公告内容..."
                  value={annContent}
                  onChange={e => setAnnContent(e.target.value)}
                  className="input min-h-[100px] resize-y"
                  required
                />
                <button type="submit" disabled={annLoading} className="btn btn-primary">
                  {annLoading ? '发布中...' : '发布公告'}
                </button>
              </div>
            </form>

            {/* Announcement list */}
            {announcements.length === 0 ? (
              <div className="empty-state py-8">暂无公告</div>
            ) : (
              <div className="space-y-4">
                {announcements.map(ann => (
                  <div key={ann.id} className="card">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100">{ann.title}</h4>
                      <button
                        onClick={() => handleDeleteAnn(ann.id)}
                        className="text-red-400 hover:text-red-500 transition-colors p-1"
                        title="删除公告"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap mb-2">{ann.content}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(ann.createdAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

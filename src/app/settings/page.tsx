'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user';
import ThemeToggle from '@/components/ThemeToggle';

export default function SettingsPage() {
  const { user, logout } = useUserStore();
  const router = useRouter();
  const [saved, setSaved] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // 密码
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');

  // 通知
  const [notifyEnabled, setNotifyEnabled] = useState(true);

  // 隐私
  const [allowStrangerMsg, setAllowStrangerMsg] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    setNotifyEnabled(localStorage.getItem('notifyEnabled') !== 'false');
    setAllowStrangerMsg(localStorage.getItem('allowStrangerMsg') !== 'false');
    setShowOnlineStatus(localStorage.getItem('showOnlineStatus') !== 'false');
  }, [user, router]);

  const handlePasswordChange = async () => {
    setPwError('');
    if (!currentPw || !newPw) return setPwError('请填写完整');
    if (newPw !== confirmPw) return setPwError('两次密码不一致');
    if (newPw.length < 6) return setPwError('密码至少 6 位');

    try {
      const res = await fetch('/api/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      if (res.ok) {
        setSaved('密码修改成功');
        setShowPasswordModal(false);
        setCurrentPw(''); setNewPw(''); setConfirmPw(''); setPwError('');
      } else {
        const data = await res.json();
        setPwError(data.error || '修改失败');
      }
    } catch {
      setPwError('网络错误');
    }
  };

  const handleNotifyToggle = () => {
    const val = !notifyEnabled;
    setNotifyEnabled(val);
    localStorage.setItem('notifyEnabled', String(val));
    setSaved('已保存');
  };

  const handlePrivacyToggle = (key: string, current: boolean) => {
    const val = !current;
    if (key === 'allowStrangerMsg') setAllowStrangerMsg(val);
    if (key === 'showOnlineStatus') setShowOnlineStatus(val);
    localStorage.setItem(key, String(val));
    setSaved('已保存');
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) { setShowDeleteConfirm(true); return; }
    try {
      const res = await fetch('/api/profile/delete', { method: 'POST', credentials: 'include' });
      if (res.ok) { logout(); router.push('/'); }
    } catch { setSaved('网络错误'); }
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="bg-gradient-to-br from-primary via-[#1f7dd6] to-accent text-white py-14 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">设置</h1>
          <p className="mt-3 max-w-2xl text-white/90">管理你的账号和安全设置。</p>
        </div>
      </div>

      <div className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
        {saved && (
          <div className={`rounded-xl px-4 py-3 text-sm ${saved.includes('成功') || saved.includes('保存') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {saved}
          </div>
        )}

        {/* 修改密码 */}
        <div className="rounded-2xl border border-white/90 bg-white/90 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">修改密码</h2>
              <p className="text-sm text-gray-400 mt-1">保护你的账号安全</p>
            </div>
            <button onClick={() => setShowPasswordModal(true)} className="btn btn-secondary">修改密码</button>
          </div>
        </div>

        {/* 主题 */}
        <div className="rounded-2xl border border-white/90 bg-white/90 p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">主题设置</h2>
          <ThemeToggle />
        </div>

        {/* 消息通知 */}
        <div className="rounded-2xl border border-white/90 bg-white/90 p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">消息通知</h2>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-700">接收新消息弹窗通知</span>
            <button
              onClick={handleNotifyToggle}
              className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${notifyEnabled ? 'bg-primary' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform mt-0.5 ${notifyEnabled ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        {/* 隐私设置 */}
        <div className="rounded-2xl border border-white/90 bg-white/90 p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">隐私设置</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-700">允许陌生人发消息</span>
              <button onClick={() => handlePrivacyToggle('allowStrangerMsg', allowStrangerMsg)} className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${allowStrangerMsg ? 'bg-primary' : 'bg-gray-300'}`}>
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform mt-0.5 ${allowStrangerMsg ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-700">显示在线状态</span>
              <button onClick={() => handlePrivacyToggle('showOnlineStatus', showOnlineStatus)} className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${showOnlineStatus ? 'bg-primary' : 'bg-gray-300'}`}>
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform mt-0.5 ${showOnlineStatus ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* 账号管理 */}
        <div className="rounded-2xl border border-white/90 bg-white/90 p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-red-600">账号管理</h2>
          <p className="text-sm text-gray-500 mb-4">注销账号后所有数据将被永久删除，无法恢复。</p>
          {showDeleteConfirm ? (
            <div className="space-y-3">
              <p className="text-red-600 font-medium">确定要注销账号吗？此操作不可撤销！</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary flex-1">取消</button>
                <button onClick={handleDeleteAccount} className="btn btn-danger flex-1">确认注销</button>
              </div>
            </div>
          ) : (
            <button onClick={handleDeleteAccount} className="btn btn-danger">注销账号</button>
          )}
        </div>
      </div>

      {/* 修改密码弹窗 */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowPasswordModal(false)}>
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">修改密码</h2>
              <button onClick={() => setShowPasswordModal(false)} className="text-2xl text-gray-400 hover:text-gray-600">×</button>
            </div>

            {pwError && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{pwError}</div>}

            <div className="space-y-4">
              <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="当前密码" className="input" />
              <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="新密码（至少6位）" className="input" />
              <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="确认新密码" className="input" />
              <button onClick={handlePasswordChange} className="btn btn-primary w-full">确认修改</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user';

type PaymentMethod = 'alipay' | 'wechat';

const RECHARGE_OPTIONS = [10, 50, 100, 200, 500, 1000];
const DIAMOND_RATE = 10;

function getInitials(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || 'U';
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, logout } = useUserStore();
  const [loadingUser, setLoadingUser] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [name, setName] = useState('');
  const [diamonds, setDiamonds] = useState(1000);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentRechargeAmount, setCurrentRechargeAmount] = useState(50);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;
    const loadUser = async () => {
      try {
        if (user) {
          if (active) { setName(user.name); setLoadingUser(false); }
          return;
        }
        const response = await fetch('/api/auth/current-user');
        if (active) {
          if (response.ok) {
            const userData = await response.json();
            if (userData) { setUser(userData); setName(userData.name); }
          }
          setLoadingUser(false);
        }
      } catch {
        if (active) setLoadingUser(false);
      }
    };
    void loadUser();
    return () => { active = false; };
  }, [setUser, user]);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  const titleText = useMemo(() => {
    if (!user) return '个人中心';
    return user.role === 'admin' ? '管理员中心' : '个人中心';
  }, [user]);

  const resetMessages = () => { setStatusMessage(''); setErrorMessage(''); };

  const handleSaveProfile = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) { setErrorMessage('昵称不能为空'); return; }
    setSavingProfile(true); resetMessages();
    try {
      const response = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '保存资料失败');
      setUser(result.user); setEditingProfile(false); setStatusMessage('资料已更新');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '保存资料失败');
    } finally { setSavingProfile(false); }
  };

  const handleRecharge = (amount: number) => {
    resetMessages(); setCurrentRechargeAmount(amount); setShowPaymentModal(true);
  };

  const handlePayment = async (method: PaymentMethod) => {
    setShowPaymentModal(false); resetMessages();
    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: currentRechargeAmount, method, userId: user?.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '创建支付失败');
      if (result.paymentUrl) window.open(result.paymentUrl, '_blank', 'noopener,noreferrer');
      const diamondsToAdd = currentRechargeAmount * DIAMOND_RATE;
      setDiamonds((current) => current + diamondsToAdd);
      setStatusMessage(`已发起 ${currentRechargeAmount} 元充值，到账 ${diamondsToAdd} 钻石`);
    } catch {
      const diamondsToAdd = currentRechargeAmount * DIAMOND_RATE;
      setDiamonds((current) => current + diamondsToAdd);
      setStatusMessage(`支付网关不可用，已切换演示支付并增加 ${diamondsToAdd} 钻石`);
    }
  };

  const handleCopyInviteLink = async () => {
    resetMessages();
    try {
      const inviteLink = `${window.location.origin}/register?ref=${user?.id || 'guest'}`;
      await navigator.clipboard.writeText(inviteLink);
      setStatusMessage('邀请链接已复制');
    } catch { setErrorMessage('复制邀请链接失败'); }
  };

  const handleLogout = async () => {
    setLoggingOut(true); resetMessages();
    try {
      const { logoutUser } = await import('@/app/actions/auth.actions');
      const result = await logoutUser();
      if (!result.success) throw new Error(result.error || '退出登录失败');
      logout(); router.push('/login');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '退出登录失败');
    } finally { setLoggingOut(false); }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen">
        <div className="bg-gradient-to-br from-primary via-[#1f7dd6] to-accent px-4 py-14 text-white">
          <div className="container mx-auto max-w-6xl">
            <h1 className="text-3xl font-bold">个人中心</h1>
            <p className="mt-2 opacity-90">正在加载账号信息...</p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center py-12">
            <div className="loading" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <div className="bg-gradient-to-br from-primary via-[#1f7dd6] to-accent px-4 py-14 text-white">
          <div className="container mx-auto max-w-6xl">
            <h1 className="text-3xl font-bold">个人中心</h1>
            <p className="mt-2 opacity-90">登录后可管理资料、订单和充值记录。</p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-12">
          <div className="card mx-auto max-w-2xl text-center border border-white/90 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">当前未登录</h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400">请先登录账号，再使用个人中心的全部功能。</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button onClick={() => router.push('/login')} className="btn btn-primary">去登录</button>
              <button onClick={() => router.push('/register')} className="btn btn-secondary">去注册</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-primary via-[#1f7dd6] to-accent px-4 py-14 text-white">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">{titleText}</h1>
          <p className="mt-3 max-w-2xl text-white/90">管理资料、充值钻石、查看订单和账号安全设置。</p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-10">
        {(statusMessage || errorMessage) && (
          <div className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
            errorMessage
              ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              : 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
          }`}>
            {errorMessage || statusMessage}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          {/* 左侧 */}
          <div className="space-y-6">
            {/* 用户信息卡片 */}
            <div className="card border border-white/90 dark:border-gray-700">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-3xl font-bold text-white shrink-0">
                  {getInitials(user.name)}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{user.name}</h2>
                    <span className="rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-400">
                      {user.role === 'admin' ? '管理员' : '普通用户'}
                    </span>
                    <span className="rounded-full bg-yellow-50 dark:bg-yellow-900/30 px-3 py-1 text-xs font-medium text-yellow-700 dark:text-yellow-400">
                      钻石 {diamonds}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">{user.email}</p>
                  <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">账号状态：{user.status === 'active' ? '正常' : user.status}</p>
                </div>
                <button onClick={() => handleRecharge(currentRechargeAmount)} className="btn btn-primary shrink-0">立即充值</button>
              </div>
            </div>

            {/* 基础资料 */}
            <div className="card border border-white/90 dark:border-gray-700">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">基础资料</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">支持修改昵称，邮箱和角色仅供查看。</p>
                </div>
                <button onClick={() => { setEditingProfile((current) => !current); setName(user.name); resetMessages(); }} className="btn btn-secondary">
                  {editingProfile ? '取消编辑' : '编辑资料'}
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">昵称</label>
                  <input type="text" value={name} onChange={(event) => setName(event.target.value)} className="input" disabled={!editingProfile} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">邮箱</label>
                  <input type="email" value={user.email} className="input bg-gray-50 dark:bg-gray-700/50" disabled />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">角色</label>
                  <input type="text" value={user.role === 'admin' ? '管理员' : '普通用户'} className="input bg-gray-50 dark:bg-gray-700/50" disabled />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">钻石余额</label>
                  <div className="flex gap-3">
                    <input type="text" value={`${diamonds} 钻石`} className="input bg-gray-50 dark:bg-gray-700/50" disabled />
                    <button onClick={() => handleRecharge(currentRechargeAmount)} className="btn btn-primary whitespace-nowrap">去充值</button>
                  </div>
                </div>
              </div>

              {editingProfile && (
                <div className="mt-6 flex justify-end">
                  <button onClick={handleSaveProfile} disabled={savingProfile} className="btn btn-primary">
                    {savingProfile ? '保存中...' : '保存资料'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 右侧 */}
          <div className="space-y-6">
            {/* 快捷操作 */}
            <div className="card border border-white/90 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">快捷操作</h3>
              <div className="mt-5 space-y-3">
                <button onClick={() => router.push('/orders')} className="btn btn-secondary w-full">查看我的订单</button>
                <button onClick={handleCopyInviteLink} className="btn btn-secondary w-full">复制邀请链接</button>
                <button onClick={handleLogout} disabled={loggingOut} className="btn btn-danger w-full">
                  {loggingOut ? '退出中...' : '退出登录'}
                </button>
              </div>
            </div>

            {/* 快速充值 */}
            <div className="card border border-white/90 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">快速充值</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">1 元 = 10 钻石，点击金额后选择支付方式。</p>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {RECHARGE_OPTIONS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleRecharge(amount)}
                    className={`rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${
                      currentRechargeAmount === amount
                        ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary/40 hover:text-primary'
                    }`}
                  >
                    {amount} 元
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 支付弹窗 */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" onClick={() => setShowPaymentModal(false)}>
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-800 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">选择支付方式</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">本次充值 {currentRechargeAmount} 元，预计到账 {currentRechargeAmount * DIAMOND_RATE} 钻石。</p>

            <div className="mt-6 space-y-3">
              <button onClick={() => handlePayment('alipay')}
                className="flex w-full items-center justify-between rounded-xl border border-blue-200 dark:border-blue-800 px-4 py-4 text-left transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/30">
                <span className="font-medium text-gray-800 dark:text-gray-100">支付宝支付</span>
                <span className="text-sm text-blue-600 dark:text-blue-400">推荐</span>
              </button>
              <button onClick={() => handlePayment('wechat')}
                className="flex w-full items-center justify-between rounded-xl border border-emerald-200 dark:border-emerald-800 px-4 py-4 text-left transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-900/30">
                <span className="font-medium text-gray-800 dark:text-gray-100">微信支付</span>
                <span className="text-sm text-emerald-600 dark:text-emerald-400">即时跳转</span>
              </button>
            </div>

            <button onClick={() => setShowPaymentModal(false)} className="mt-6 w-full rounded-xl bg-gray-100 dark:bg-gray-700 py-3 text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600">
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

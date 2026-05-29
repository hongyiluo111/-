'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const games = ['三角洲行动', '王者荣耀', '英雄联盟', '和平精英', 'CS2', 'DOTA2', '无畏契约', '金铲铲之战'];
const ranks = ['青铜', '白银', '黄金', '铂金', '钻石', '大师', '王者'];

const steps = [
  { num: 1, title: '提交申请', desc: '填写个人信息和游戏资料' },
  { num: 2, title: '资料审核', desc: '管理员审核您的申请资料' },
  { num: 3, title: '审核通过', desc: '收到通知，完善个人主页' },
  { num: 4, title: '开始接单', desc: '上架服务，接受用户预约' },
];

export default function BecomeCompanionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    game: '',
    rank: '',
    price: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/companions/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          game: formData.game,
          rank: formData.rank,
          price: Number(formData.price),
          description: formData.description,
        }),
      });
      const data = await response.json();

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || '申请失败');
      }

      setSuccess('申请已提交，等待审核通过后将上架。');
      setFormData({
        name: '',
        game: '',
        rank: '',
        price: '',
        description: '',
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '申请失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-gradient-to-r from-primary to-accent text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">申请成为陪玩</h1>
          <p className="mt-2 opacity-90">填写你的游戏信息与服务报价，提交后由平台审核</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">
            为什么成为陪玩师
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card text-center p-8">
              <div className="mx-auto w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">收入自由</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                自由定价，灵活接单，多劳多得，月入可观
              </p>
            </div>
            <div className="card text-center p-8">
              <div className="mx-auto w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">技能变现</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                将你的游戏技能转化为收入，做自己喜欢的事
              </p>
            </div>
            <div className="card text-center p-8">
              <div className="mx-auto w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">社交拓展</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                结识更多游戏好友，扩大你的社交圈
              </p>
            </div>
          </div>
        </div>

        <div className="card mb-12 p-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">申请条件</h2>
          <ul className="max-w-xl mx-auto space-y-4">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex-shrink-0 w-6 h-6 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="text-gray-700 dark:text-gray-300">年满18周岁</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex-shrink-0 w-6 h-6 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="text-gray-700 dark:text-gray-300">至少精通一款平台支持的游戏</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex-shrink-0 w-6 h-6 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="text-gray-700 dark:text-gray-300">拥有良好的沟通能力和服务意识</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex-shrink-0 w-6 h-6 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="text-gray-700 dark:text-gray-300">能够保证稳定的在线时间</span>
            </li>
          </ul>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">审核流程</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-0">
            {steps.map((step, index) => (
              <div key={step.num} className="flex items-center">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold shadow-md">
                    {step.num}
                  </div>
                  <h3 className="mt-3 font-semibold text-gray-800 dark:text-gray-100">{step.title}</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-[140px]">{step.desc}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block w-16 lg:w-24 h-0.5 bg-primary/30 dark:bg-primary/20 mx-2 -mt-8" />
                )}
                {index < steps.length - 1 && (
                  <div className="md:hidden w-0.5 h-10 bg-primary/30 dark:bg-primary/20 my-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">陪玩申请表</h2>

          {error && <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700">{error}</div>}
          {success && <div className="mb-4 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-green-700">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 mb-2">展示昵称</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="input" required />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">游戏</label>
                <select name="game" value={formData.game} onChange={handleChange} className="select" required>
                  <option value="">请选择游戏</option>
                  {games.map((game) => (
                    <option key={game} value={game}>
                      {game}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 mb-2">段位</label>
                <select name="rank" value={formData.rank} onChange={handleChange} className="select" required>
                  <option value="">请选择段位</option>
                  {ranks.map((rank) => (
                    <option key={rank} value={rank}>
                      {rank}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">价格（元/小时）</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="input"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">个人介绍</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input h-32"
                required
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? '提交中...' : '提交申请'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

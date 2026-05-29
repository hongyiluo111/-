'use client';

import { useState } from 'react';
import AdminGuard from '@/components/AdminGuard';

export default function AdminSettingsPage() {
  const [platformName, setPlatformName] = useState('电竞陪玩平台');
  const [commissionRate, setCommissionRate] = useState(10);
  const [minPrice, setMinPrice] = useState(5);
  const [maxPrice, setMaxPrice] = useState(500);
  const [announcement, setAnnouncement] = useState('');

  const [platformSaved, setPlatformSaved] = useState(false);
  const [priceSaved, setPriceSaved] = useState(false);
  const [announceSaved, setAnnounceSaved] = useState(false);

  const handleSavePlatform = () => {
    setPlatformSaved(true);
    setTimeout(() => setPlatformSaved(false), 2000);
  };

  const handleSavePrice = () => {
    setPriceSaved(true);
    setTimeout(() => setPriceSaved(false), 2000);
  };

  const handleSaveAnnouncement = () => {
    setAnnounceSaved(true);
    setTimeout(() => setAnnounceSaved(false), 2000);
  };

  return (
    <AdminGuard>
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary to-accent px-4 py-12 text-white">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">系统设置</h1>
          <p className="mt-2 opacity-90">管理平台基础配置</p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
          系统配置功能开发中，当前为演示界面
        </div>

        <div className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">平台设置</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-600">平台名称</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary md:max-w-md"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">平台抽成比例 (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary md:max-w-xs"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                />
                <p className="mt-1 text-xs text-gray-400">范围: 0-100%</p>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleSavePlatform}
                  className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
                >
                  {platformSaved ? '已保存 ✓' : '保存设置'}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">价格限制</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-gray-600">最低价格 (元/小时)</label>
                  <input
                    type="number"
                    min={0}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Math.max(0, Number(e.target.value) || 0))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-600">最高价格 (元/小时)</label>
                  <input
                    type="number"
                    min={0}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Math.max(0, Number(e.target.value) || 0))}
                  />
                </div>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleSavePrice}
                  className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
                >
                  {priceSaved ? '已保存 ✓' : '保存设置'}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">公告管理</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-600">公告内容</label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  rows={5}
                  placeholder="输入平台公告内容..."
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-400">公告将在用户端首页展示</p>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleSaveAnnouncement}
                  className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
                >
                  {announceSaved ? '已保存 ✓' : '保存设置'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </AdminGuard>
  );
}

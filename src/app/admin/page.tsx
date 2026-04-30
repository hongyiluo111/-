import Link from 'next/link';

const cards = [
  {
    title: '用户管理',
    desc: '查看用户账号、角色与封禁状态。',
    href: '/admin/users',
  },
  {
    title: '陪玩管理',
    desc: '维护陪玩资料、状态与归属用户。',
    href: '/admin/companions',
  },
  {
    title: '订单管理',
    desc: '跟踪订单生命周期并处理状态流转。',
    href: '/admin/orders',
  },
  {
    title: '系统设置',
    desc: '查看后台设置入口与扩展配置位。',
    href: '/admin/settings',
  },
];

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-primary via-[#1f7dd6] to-accent px-4 py-14 text-white">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">后台管理</h1>
          <p className="mt-3 max-w-2xl text-white/90">管理用户、陪玩、订单和系统配置。</p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {cards.map((card) => (
            <Link key={card.href} href={card.href} className="card border border-white/90 transition-all hover:-translate-y-1 hover:shadow-xl">
              <h2 className="mb-3 text-2xl font-semibold">{card.title}</h2>
              <p className="mb-4 text-gray-600">{card.desc}</p>
              <div className="flex justify-end">
                <span className="font-medium text-primary">进入详情 →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

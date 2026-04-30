import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-14 text-white">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">鸿一电竞</h3>
            <p className="text-slate-300">
              专业的电竞陪玩平台，连接游戏高手与玩家
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">快速链接</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-slate-300 hover:text-white transition-colors">首页</Link></li>
              <li><Link href="/find-companion" className="text-slate-300 hover:text-white transition-colors">找陪玩</Link></li>
              <li><Link href="/become-companion" className="text-slate-300 hover:text-white transition-colors">成为陪玩</Link></li>
              <li><Link href="/orders" className="text-slate-300 hover:text-white transition-colors">订单管理</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">支持</h4>
            <ul className="space-y-2">
              <li><Link href="/faq" className="text-slate-300 hover:text-white transition-colors">常见问题</Link></li>
              <li><Link href="/terms" className="text-slate-300 hover:text-white transition-colors">服务条款</Link></li>
              <li><Link href="/privacy" className="text-slate-300 hover:text-white transition-colors">隐私政策</Link></li>
              <li><Link href="/contact" className="text-slate-300 hover:text-white transition-colors">联系我们</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">联系我们</h4>
            <ul className="space-y-2">
              <li className="text-slate-300">邮箱: contact@hongyi-esports.com</li>
              <li className="text-slate-300">电话: 123-4567-8910</li>
              <li className="text-slate-300">地址: 北京市朝阳区电竞大厦</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-700/70 pt-8 text-center text-slate-300">
          <p>© 2026 鸿一电竞. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  );
}
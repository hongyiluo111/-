import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="text-6xl font-bold text-gray-300 dark:text-gray-600">404</div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">页面不存在</h2>
      <p className="text-gray-500 dark:text-gray-400">你访问的页面可能已被移除或地址有误。</p>
      <Link
        href="/"
        className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-primary/90 transition-colors"
      >
        返回首页
      </Link>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary to-accent px-4 py-12 text-white">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">系统设置</h1>
          <p className="mt-2 opacity-90">后台基础配置与说明</p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-3 text-xl font-semibold">当前说明</h2>
          <p className="mb-2 text-gray-700">
            该页面用于承接后台设置入口，避免导航死链。后续可以在这里扩展支付参数、审核策略、通知策略等配置。
          </p>
          <p className="text-sm text-gray-500">当前版本先提供页面入口与文案占位，确保后台功能完整可达。</p>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
export const metadata: Metadata = { title: '个人中心 - 鸿一电竞', description: '管理你的账号信息和钻石余额' };
export default function ProfileLayout({ children }: { children: React.ReactNode }) { return children; }

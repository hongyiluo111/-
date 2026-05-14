import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import QueryProvider from '@/components/QueryProvider';
import AIService from '@/components/AIService';
import ThemeProvider from '@/components/ThemeProvider';
import { ToastProvider } from '@/components/Toast';
import OrderNotification from '@/components/OrderNotification';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '鸿一电竞 - 专业电竞陪玩平台',
  description: '为玩家提供专业的电竞陪玩服务，连接游戏高手与玩家',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <ThemeProvider>
          <QueryProvider>
            <ToastProvider>
              <Navbar />
              <div className="pt-16 page-enter">{children}</div>
              <AIService />
              <OrderNotification />
            </ToastProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
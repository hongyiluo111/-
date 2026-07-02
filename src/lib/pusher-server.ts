import Pusher from 'pusher';

let _pusherServer: Pusher | null = null;

/**
 * 懒加载 Pusher 服务端单例。
 * - 模块加载时不创建实例，避免无关请求开销
 * - 环境变量未配置时抛错，由调用方 catch
 * - 首次调用时创建，后续复用
 */
export function getPusherServer(): Pusher {
  if (_pusherServer) return _pusherServer;

  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!appId || !key || !secret || !cluster) {
    throw new Error('Pusher server environment variables not configured');
  }

  _pusherServer = new Pusher({ appId, key, secret, cluster, useTLS: true });
  return _pusherServer;
}

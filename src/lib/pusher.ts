import Pusher from 'pusher-js';

const globalForPusher = globalThis as unknown as {
  pusherInstance?: Pusher;
  pusherRefCount?: number;
};

function createPusher(): Pusher {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
  if (!key || !cluster) {
    throw new Error('Pusher environment variables not configured');
  }
  return new Pusher(key, { cluster, forceTLS: true });
}

export function getPusher(): Pusher {
  if (!globalForPusher.pusherInstance) {
    globalForPusher.pusherInstance = createPusher();
    globalForPusher.pusherRefCount = 0;
  }
  globalForPusher.pusherRefCount!++;
  return globalForPusher.pusherInstance;
}

export function releasePusher(): void {
  if (!globalForPusher.pusherRefCount) return;
  globalForPusher.pusherRefCount--;
  if (globalForPusher.pusherRefCount <= 0) {
    globalForPusher.pusherRefCount = 0;
    if (globalForPusher.pusherInstance) {
      globalForPusher.pusherInstance.disconnect();
      globalForPusher.pusherInstance = undefined as unknown as Pusher;
    }
  }
}

export default getPusher;

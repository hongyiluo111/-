import { AccessToken } from 'livekit-server-sdk';
import type { AccessTokenOptions } from 'livekit-server-sdk';

/**
 * 生成 LiveKit 访问 token。
 * 服务端调用，不暴露 API key/secret 到前端。
 */
export async function createLiveKitToken(
  roomName: string,
  participantIdentity: string,
  participantName: string,
  metadata?: string,
): Promise<string> {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('LIVEKIT_API_KEY / LIVEKIT_API_SECRET not configured');
  }

  const tokenOpts: AccessTokenOptions = {
    identity: participantIdentity,
    name: participantName,
    ttl: 4 * 60 * 60, // 4 小时
  };
  if (metadata) {
    tokenOpts.metadata = metadata;
  }

  const at = new AccessToken(apiKey, apiSecret, tokenOpts);
  at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });

  return await at.toJwt();
}

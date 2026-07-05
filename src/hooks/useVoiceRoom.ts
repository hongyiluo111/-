'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  Room,
  RoomEvent,
  ConnectionState,
  Track,
  type RemoteParticipant,
} from 'livekit-client';
import { useVoiceRoomStore } from '@/store/voiceRoom';
import type { VoiceMemberInfo } from '@/store/voiceRoom';

interface UseVoiceRoomReturn {
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  switchChannel: (channelId: string) => Promise<void>;
  toggleMic: () => void;
  toggleSpeaker: () => void;
}

export function useVoiceRoom(currentUserId: string | null): UseVoiceRoomReturn {
  const store = useVoiceRoomStore();
  const storeRef = useRef(store);
  storeRef.current = store;
  const userIdRef = useRef(currentUserId);
  userIdRef.current = currentUserId;

  const roomRef = useRef<Room | null>(null);
  const leaveRoomRef = useRef<(() => Promise<void>) | null>(null);

  /* 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ LiveKit Room 鍒濆鍖?鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */

  const setupRoomEvents = useCallback((room: Room) => {
    room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
      if (state === ConnectionState.Connected) {
        storeRef.current.setConnecting(false);
        storeRef.current.setJoinedAt(Date.now());
      }
      if (state === ConnectionState.Disconnected) {
        if (storeRef.current.joinedAt) {
          leaveRoomRef.current?.();
        }
      }
    });

    room.on(RoomEvent.ParticipantConnected, (p: RemoteParticipant) => {
      const member: VoiceMemberInfo = {
        userId: p.identity,
        name: p.name || p.identity,
        avatar: p.metadata || '',
        role: 'listener',
        isMuted: !p.isMicrophoneEnabled,
        isDeafened: false,
        isSpeaking: false,
        channelId: storeRef.current.currentChannelId || '',
      };
      storeRef.current.addMember(member);
    });

    room.on(RoomEvent.ParticipantDisconnected, (p: RemoteParticipant) => {
      storeRef.current.removeMember(p.identity);
    });

    room.on(RoomEvent.TrackSubscribed, (_track, _pub, p: RemoteParticipant) => {
      storeRef.current.updateMember(p.identity, {
        isMuted: !p.isMicrophoneEnabled,
      });
    });

    room.on(RoomEvent.ParticipantMetadataChanged, (metadata: string | undefined, p) => {
      if (metadata) {
        storeRef.current.updateMember(p.identity, { avatar: metadata });
      }
    });

    room.on(RoomEvent.TrackMuted, (_pub, p) => {
      storeRef.current.updateMember(p.identity, { isMuted: true, isSpeaking: false });
    });

    room.on(RoomEvent.TrackUnmuted, (_pub, p) => {
      storeRef.current.updateMember(p.identity, { isMuted: false });
    });

    room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
      const speakingIdentities = new Set(speakers.map((s) => s.identity));
      storeRef.current.members.forEach((m) => {
        const isSpeaking = speakingIdentities.has(m.userId);
        if (m.isSpeaking !== isSpeaking) {
          storeRef.current.updateMember(m.userId, { isSpeaking });
        }
      });
    });
  }, []);

  /* 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ 鍔犲叆 / 绂诲紑鎴块棿 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */

  const joinRoom = useCallback(
    async (roomId: string) => {
      try {
        storeRef.current.setConnecting(true);
        storeRef.current.setConnectionError(null);

        const roomRes = await fetch(`/api/voice-rooms/${roomId}`);
        if (!roomRes.ok) throw new Error('鑾峰彇鎴块棿淇℃伅澶辫触');
        const { room: roomData } = await roomRes.json();

        storeRef.current.setRoom(roomId, roomData.name, roomData.type);
        storeRef.current.setChannels(roomData.channels || []);
        storeRef.current.setCurrentChannel(roomData.channels?.[0]?.id || `${roomId}-lobby`);

        const tokenRes = await fetch('/api/livekit/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomName: roomId }),
        });
        if (!tokenRes.ok) throw new Error('鑾峰彇璇煶 token 澶辫触');
        const { token } = await tokenRes.json();

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          video: false,
        });
        storeRef.current.setLocalStream(stream);

        const room = new Room({ adaptiveStream: true, dynacast: true });
        roomRef.current = room;
        setupRoomEvents(room);

        const url = process.env.NEXT_PUBLIC_LIVEKIT_URL || 'ws://127.0.0.1:7880';
        await room.connect(url, token);

        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack) {
          await room.localParticipant.publishTrack(audioTrack, {
            name: 'microphone',
            source: Track.Source.Microphone,
          });
        }

        storeRef.current.setConnecting(false);
      } catch (err) {
        console.error('Join room error:', err);
        storeRef.current.setConnectionError(err instanceof Error ? err.message : '鍔犲叆鎴块棿澶辫触');
        storeRef.current.setConnecting(false);

        if (roomRef.current) {
          roomRef.current.disconnect();
          roomRef.current = null;
        }
        storeRef.current.reset();
      }
    },
    [setupRoomEvents],
  );

  const leaveRoom = useCallback(async () => {
    const stream = storeRef.current.localStream;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }

    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }

    storeRef.current.reset();
  }, []);
  leaveRoomRef.current = leaveRoom;

  /* 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ 棰戦亾鍒囨崲 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */

  const switchChannel = useCallback(
    async (channelId: string) => {
      storeRef.current.setCurrentChannel(channelId);
    },
    [],
  );

  /* 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ 楹﹀厠椋?/ 鎵０鍣?鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */

  const toggleMic = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;

    const newMuted = !storeRef.current.isMicMuted;
    room.localParticipant.setMicrophoneEnabled(!newMuted);
    storeRef.current.setMicMuted(newMuted);
  }, []);

  const toggleSpeaker = useCallback(() => {
    const newMuted = !storeRef.current.isSpeakerMuted;
    storeRef.current.setSpeakerMuted(newMuted);

    roomRef.current?.remoteParticipants.forEach((p) => {
      p.audioTrackPublications.forEach((pub) => {
        pub.setEnabled(!newMuted);
      });
    });
  }, []);

  /* 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ 娓呯悊 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */

  useEffect(() => {
    return () => {
      leaveRoom();
    };
  }, [leaveRoom]);

  return { joinRoom, leaveRoom, switchChannel, toggleMic, toggleSpeaker };
}


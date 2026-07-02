'use client';

import { useCallback, useEffect, useRef } from 'react';
import Pusher from 'pusher-js';
import { getPusher, releasePusher } from '@/lib/pusher';
import { useVoiceRoomStore } from '@/store/voiceRoom';
import type { PresenceChannel } from 'pusher-js';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

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

  const pusherChannelRef = useRef<PresenceChannel | null>(null);
  const pusherRef = useRef<Pusher | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<Map<string, AnalyserNode>>(new Map());
  const speakingCheckRef = useRef<NodeJS.Timeout | null>(null);
  const leaveRoomRef = useRef<(() => Promise<void>) | null>(null);

  const cleanupPeers = useCallback(() => {
    peersRef.current.forEach((pc) => pc.close());
    peersRef.current.clear();
    analyserRef.current.clear();
    audioElementsRef.current.forEach((audio) => {
      audio.pause();
      audio.srcObject = null;
      audio.remove();
    });
    audioElementsRef.current.clear();
  }, []);

  const stopLocalStream = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      storeRef.current.setLocalStream(null);
    }
  }, []);

  const getLocalStream = useCallback(async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: false,
      });
      localStreamRef.current = stream;
      storeRef.current.setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('Failed to get local stream:', err);
      storeRef.current.setConnectionError('无法获取麦克风权限');
      return null;
    }
  }, []);

  const createPeerConnection = useCallback(
    (targetUserId: string, isInitiator: boolean, stream: MediaStream, channel: PresenceChannel) => {
      // Close existing connection if any
      const existing = peersRef.current.get(targetUserId);
      if (existing) {
        existing.close();
        peersRef.current.delete(targetUserId);
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (!remoteStream) return;

        let audio = audioElementsRef.current.get(targetUserId);
        if (!audio) {
          audio = document.createElement('audio');
          audio.autoplay = true;
          audio.id = `voice-peer-${targetUserId}`;
          audio.volume = storeRef.current.isSpeakerMuted ? 0 : 1;
          document.body.appendChild(audio);
          audioElementsRef.current.set(targetUserId, audio);
        }
        audio.srcObject = remoteStream;

        // Audio analysis for speaking indicator
        try {
          if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
            audioContextRef.current = new AudioContext();
          }
          if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
          }
          const source = audioContextRef.current.createMediaStreamSource(remoteStream);
          const analyser = audioContextRef.current.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);
          analyserRef.current.set(targetUserId, analyser);
        } catch { /* optional */ }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          channel.trigger('client-ice-candidate', {
            from: userIdRef.current,
            to: targetUserId,
            candidate: event.candidate.toJSON(),
          });
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed') {
          peersRef.current.delete(targetUserId);
          const audio = audioElementsRef.current.get(targetUserId);
          if (audio) { audio.pause(); audio.srcObject = null; audio.remove(); audioElementsRef.current.delete(targetUserId); }
        }
      };

      peersRef.current.set(targetUserId, pc);

      if (isInitiator) {
        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .then(() => {
            channel.trigger('client-sdp-offer', {
              from: userIdRef.current,
              to: targetUserId,
              sdp: pc.localDescription!.toJSON(),
            });
          })
          .catch((err) => console.error('Failed to create offer:', err));
      }

      return pc;
    },
    []
  );

  const setupSignaling = useCallback(
    (channel: PresenceChannel, stream: MediaStream) => {
      channel.bind('client-sdp-offer', async (data: { from: string; to: string; sdp: RTCSessionDescriptionInit }) => {
        if (data.to !== userIdRef.current) return;

        let pc = peersRef.current.get(data.from);
        if (!pc) {
          pc = createPeerConnection(data.from, false, stream, channel);
        }

        try {
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          channel.trigger('client-sdp-answer', {
            from: userIdRef.current,
            to: data.from,
            sdp: answer,
          });
        } catch (err) {
          console.error('Failed to handle offer:', err);
        }
      });

      channel.bind('client-sdp-answer', async (data: { from: string; to: string; sdp: RTCSessionDescriptionInit }) => {
        if (data.to !== userIdRef.current) return;
        const pc = peersRef.current.get(data.from);
        if (pc) {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          } catch (err) {
            console.error('Failed to handle answer:', err);
          }
        }
      });

      channel.bind('client-ice-candidate', async (data: { from: string; to: string; candidate: RTCIceCandidateInit }) => {
        if (data.to !== userIdRef.current) return;
        const pc = peersRef.current.get(data.from);
        if (pc && data.candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch (err) {
            console.error('Failed to add ICE candidate:', err);
          }
        }
      });
    },
    [createPeerConnection]
  );

  const startSpeakingDetection = useCallback(() => {
    if (speakingCheckRef.current) clearInterval(speakingCheckRef.current);
    speakingCheckRef.current = setInterval(() => {
      analyserRef.current.forEach((analyser, userId) => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((s, v) => s + v, 0) / dataArray.length;
        const isSpeaking = avg > 20;
        const member = storeRef.current.members.find((m) => m.userId === userId);
        if (member && member.isSpeaking !== isSpeaking) {
          storeRef.current.updateMember(userId, { isSpeaking });
        }
      });
    }, 150);
  }, []);

  const connectToChannelMembers = useCallback(
    (channel: PresenceChannel, stream: MediaStream, channelId: string) => {
      const members = storeRef.current.members.filter(
        (m) => m.channelId === channelId && m.userId !== userIdRef.current
      );
      members.forEach((m) => createPeerConnection(m.userId, true, stream, channel));
    },
    [createPeerConnection]
  );

  const joinRoom = useCallback(
    async (roomId: string) => {
      try {
        store.setConnecting(true);
        store.setConnectionError(null);

        const res = await fetch(`/api/voice-rooms/${roomId}`);
        if (!res.ok) throw new Error('获取房间信息失败');
        const { room } = await res.json();

        store.setRoom(room.id, room.name, room.type);
        store.setChannels(room.channels);
        store.setMembers(room.members.map((m: Record<string, unknown>) => ({ ...m, isSpeaking: false })));

        const joinRes = await fetch(`/api/voice-rooms/${roomId}/join`, { method: 'POST' });
        if (!joinRes.ok) throw new Error('加入房间失败');
        const joinData = await joinRes.json();
        store.setCurrentChannel(joinData.channelId);

        const stream = await getLocalStream();
        if (!stream) { store.setConnecting(false); return; }

        const pusher = getPusher();
        pusherRef.current = pusher;
        const channelName = `presence-voice-room-${roomId}`;
        const channel = pusher.subscribe(channelName) as PresenceChannel;
        pusherChannelRef.current = channel;

        channel.bind('pusher:subscription_succeeded', () => {
          storeRef.current.setConnecting(false);
          storeRef.current.setJoinedAt(Date.now());

          const currentChannelId = storeRef.current.currentChannelId;
          if (currentChannelId) {
            connectToChannelMembers(channel, stream, currentChannelId);
          }

          setupSignaling(channel, stream);
          startSpeakingDetection();
        });

        channel.bind('pusher:member_added', (member: { id: string; info: { name: string; avatar: string; role: string } }) => {
          const { id, info } = member;
          storeRef.current.addMember({
            userId: id, name: info.name || '新成员', avatar: info.avatar || '',
            role: info.role || 'listener', isMuted: false, isDeafened: false,
            isSpeaking: false, channelId: '',
          });
        });

        channel.bind('pusher:member_removed', (member: { id: string }) => {
          const pc = peersRef.current.get(member.id);
          if (pc) { pc.close(); peersRef.current.delete(member.id); }
          const audio = audioElementsRef.current.get(member.id);
          if (audio) { audio.pause(); audio.srcObject = null; audio.remove(); audioElementsRef.current.delete(member.id); }
          analyserRef.current.delete(member.id);
          storeRef.current.removeMember(member.id);
        });

        channel.bind('member-added', (data: { userId: string; channelId: string }) => {
          if (data.userId !== userIdRef.current && data.channelId === storeRef.current.currentChannelId) {
            const localStream = localStreamRef.current;
            if (localStream) createPeerConnection(data.userId, true, localStream, channel);
          }
        });

        channel.bind('member-removed', (data: { userId: string }) => {
          const pc = peersRef.current.get(data.userId);
          if (pc) { pc.close(); peersRef.current.delete(data.userId); }
          const audio = audioElementsRef.current.get(data.userId);
          if (audio) { audio.pause(); audio.srcObject = null; audio.remove(); audioElementsRef.current.delete(data.userId); }
        });

        channel.bind('client-switch-channel', (data: { userId: string; fromChannelId: string; toChannelId: string }) => {
          if (data.userId === userIdRef.current) return;
          const currentChannelId = storeRef.current.currentChannelId;

          if (data.fromChannelId === currentChannelId) {
            const pc = peersRef.current.get(data.userId);
            if (pc) { pc.close(); peersRef.current.delete(data.userId); }
            const audio = audioElementsRef.current.get(data.userId);
            if (audio) { audio.pause(); audio.srcObject = null; audio.remove(); audioElementsRef.current.delete(data.userId); }
          }

          if (data.toChannelId === currentChannelId) {
            const localStream = localStreamRef.current;
            if (localStream) createPeerConnection(data.userId, true, localStream, channel);
          }

          storeRef.current.updateMember(data.userId, { channelId: data.toChannelId });
        });

        channel.bind('client-mute-changed', (data: { userId: string; isMuted: boolean; isDeafened: boolean }) => {
          storeRef.current.updateMember(data.userId, { isMuted: data.isMuted, isDeafened: data.isDeafened });
        });

        channel.bind('room-closed', () => { leaveRoomRef.current?.(); });
      } catch (err) {
        console.error('Join room error:', err);
        // 若 getPusher 已成功但后续抛错，需配对释放避免引用计数泄漏
        if (pusherRef.current) {
          pusherChannelRef.current?.unbind_all();
          pusherRef.current = null;
          releasePusher();
        }
        store.setConnectionError(err instanceof Error ? err.message : '加入房间失败');
        store.setConnecting(false);
      }
    },
    [store, getLocalStream, createPeerConnection, setupSignaling, startSpeakingDetection, connectToChannelMembers]
  );

  const leaveRoom = useCallback(async () => {
    const roomId = storeRef.current.roomId;
    if (roomId) {
      try { await fetch(`/api/voice-rooms/${roomId}/leave`, { method: 'POST' }); } catch { /* */ }
    }

    if (pusherChannelRef.current) {
      pusherChannelRef.current.unbind_all();
      const channelName = `presence-voice-room-${roomId}`;
      pusherRef.current?.unsubscribe(channelName);
      pusherChannelRef.current = null;
    }

    cleanupPeers();
    stopLocalStream();

    if (speakingCheckRef.current) { clearInterval(speakingCheckRef.current); speakingCheckRef.current = null; }
    if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }

    // 配对 joinRoom 中的 getPusher()，引用计数归零时自动 disconnect
    if (pusherRef.current) {
      releasePusher();
      pusherRef.current = null;
    }

    storeRef.current.reset();
  }, [cleanupPeers, stopLocalStream]);
  leaveRoomRef.current = leaveRoom;

  const switchChannel = useCallback(
    async (channelId: string) => {
      if (!storeRef.current.roomId) return;

      try {
        cleanupPeers();

        const res = await fetch(`/api/voice-channels/${channelId}/join`, { method: 'POST' });
        if (!res.ok) throw new Error('切换频道失败');
        const data = await res.json();

        storeRef.current.setCurrentChannel(channelId);
        if (data.counts) {
          Object.entries(data.counts).forEach(([chId, count]) => {
            storeRef.current.updateChannelCount(chId, count as number);
          });
        }

        const stream = localStreamRef.current;
        const channel = pusherChannelRef.current;
        if (stream && channel) {
          connectToChannelMembers(channel, stream, channelId);
        }
      } catch (err) {
        console.error('Switch channel error:', err);
        storeRef.current.setConnectionError('切换频道失败');
      }
    },
    [cleanupPeers, connectToChannelMembers]
  );

  const toggleMic = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const track = stream.getAudioTracks()[0];
    if (!track) return;

    const newMuted = !storeRef.current.isMicMuted;
    track.enabled = !newMuted;
    storeRef.current.setMicMuted(newMuted);

    const roomId = storeRef.current.roomId;
    if (roomId) {
      pusherChannelRef.current?.trigger('client-mute-changed', {
        userId: userIdRef.current,
        isMuted: newMuted,
        isDeafened: storeRef.current.isSpeakerMuted,
      });
      fetch(`/api/voice-rooms/${roomId}/mute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isMuted: newMuted }),
      }).catch(() => {});
    }
  }, []);

  const toggleSpeaker = useCallback(() => {
    const newMuted = !storeRef.current.isSpeakerMuted;
    storeRef.current.setSpeakerMuted(newMuted);
    audioElementsRef.current.forEach((audio) => { audio.muted = newMuted; });

    const roomId = storeRef.current.roomId;
    if (roomId) {
      pusherChannelRef.current?.trigger('client-mute-changed', {
        userId: userIdRef.current,
        isMuted: storeRef.current.isMicMuted,
        isDeafened: newMuted,
      });
      fetch(`/api/voice-rooms/${roomId}/mute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDeafened: newMuted }),
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    return () => { leaveRoom(); };
  }, [leaveRoom]);

  return { joinRoom, leaveRoom, switchChannel, toggleMic, toggleSpeaker };
}

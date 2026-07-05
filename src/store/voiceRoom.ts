import { create } from 'zustand';

export interface VoiceChannelInfo {
  id: string;
  name: string;
  sortOrder: number;
  participantCount?: number; // 由组件层从 members 实时计算
}

export interface VoiceMemberInfo {
  userId: string;
  name: string;
  avatar: string;
  role: string;
  isMuted: boolean;
  isDeafened: boolean;
  isSpeaking: boolean;
  channelId: string;
}

interface VoiceRoomState {
  // Room info
  roomId: string | null;
  roomName: string | null;
  roomType: string | null;
  isOpen: boolean;
  isMinimized: boolean;

  // Channels
  channels: VoiceChannelInfo[];
  currentChannelId: string | null;

  // Members
  members: VoiceMemberInfo[];

  // Local audio
  localStream: MediaStream | null;
  isMicMuted: boolean;
  isSpeakerMuted: boolean;

  // Connection state
  isConnecting: boolean;
  connectionError: string | null;
  joinedAt: number | null;

  // Actions
  setRoom: (roomId: string, roomName: string, roomType: string) => void;
  setOpen: (open: boolean) => void;
  setMinimized: (min: boolean) => void;
  setChannels: (channels: VoiceChannelInfo[]) => void;
  setCurrentChannel: (channelId: string | null) => void;
  setMembers: (members: VoiceMemberInfo[]) => void;
  addMember: (member: VoiceMemberInfo) => void;
  removeMember: (userId: string) => void;
  updateMember: (userId: string, updates: Partial<VoiceMemberInfo>) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setMicMuted: (muted: boolean) => void;
  setSpeakerMuted: (muted: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setConnectionError: (error: string | null) => void;
  setJoinedAt: (time: number | null) => void;
  reset: () => void;
}

const initialState = {
  roomId: null as string | null,
  roomName: null as string | null,
  roomType: null as string | null,
  isOpen: false,
  isMinimized: false,
  channels: [] as VoiceChannelInfo[],
  currentChannelId: null as string | null,
  members: [] as VoiceMemberInfo[],
  localStream: null as MediaStream | null,
  isMicMuted: false,
  isSpeakerMuted: false,
  isConnecting: false,
  connectionError: null as string | null,
  joinedAt: null as number | null,
};

export const useVoiceRoomStore = create<VoiceRoomState>((set) => ({
  ...initialState,

  setRoom: (roomId, roomName, roomType) =>
    set({ roomId, roomName, roomType, isOpen: true }),

  setOpen: (open) => set({ isOpen: open }),

  setMinimized: (min) => set({ isMinimized: min }),

  setChannels: (channels) => set({ channels }),

  setCurrentChannel: (channelId) => set({ currentChannelId: channelId }),

  setMembers: (members) => set({ members }),

  addMember: (member) =>
    set((state) => ({
      members: state.members.some((m) => m.userId === member.userId)
        ? state.members.map((m) => (m.userId === member.userId ? { ...m, ...member } : m))
        : [...state.members, member],
    })),

  removeMember: (userId) =>
    set((state) => ({
      members: state.members.filter((m) => m.userId !== userId),
    })),

  updateMember: (userId, updates) =>
    set((state) => ({
      members: state.members.map((m) =>
        m.userId === userId ? { ...m, ...updates } : m,
      ),
    })),

  setLocalStream: (stream) => set({ localStream: stream }),

  setMicMuted: (muted) => set({ isMicMuted: muted }),

  setSpeakerMuted: (muted) => set({ isSpeakerMuted: muted }),

  setConnecting: (connecting) => set({ isConnecting: connecting }),

  setConnectionError: (error) => set({ connectionError: error }),

  setJoinedAt: (time) => set({ joinedAt: time }),

  reset: () =>
    set((state) => {
      if (state.localStream) {
        state.localStream.getTracks().forEach((t) => t.stop());
      }
      return initialState;
    }),
}));

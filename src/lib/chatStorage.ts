export interface ChatMessage {
  role: string;
  content: string;
  timestamp: number;
}

const STORAGE_PREFIX = 'chat_history_';

function getUserId(): string {
  try {
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='));
    return cookie ? cookie.split('=')[1] : 'anonymous';
  } catch {
    return 'anonymous';
  }
}

function getStorageKey(companionName: string): string {
  return `${STORAGE_PREFIX}${getUserId()}_${companionName}`;
}

export function loadChatHistory(companionName: string): ChatMessage[] {
  try {
    const key = getStorageKey(companionName);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveChatHistory(companionName: string, messages: ChatMessage[]): void {
  try {
    const key = getStorageKey(companionName);
    localStorage.setItem(key, JSON.stringify(messages));
  } catch (e) {
    console.error('保存聊天记录失败:', e);
  }
}

export function clearChatHistory(companionName: string): void {
  try {
    const key = getStorageKey(companionName);
    localStorage.removeItem(key);
  } catch (e) {
    console.error('清除聊天记录失败:', e);
  }
}

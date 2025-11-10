export interface ChatHistoryItem {
  id: string;
  timestamp: number;
  query: string;
  result: string;
  metrics: {
    thinkingTokens: number;
    toolCalls: number;
    elapsedTime: number;
    inputTokens: number;
    outputTokens: number;
  };
  thinkingSteps?: number;
  toolCallsExecuted?: string[];
}

const STORAGE_KEY = 'kimi_k2_chat_history';
const MAX_HISTORY_ITEMS = 50;

export function saveChatHistory(item: ChatHistoryItem): void {
  try {
    const history = getChatHistory();
    history.unshift(item); // Add to beginning
    
    // Keep only the most recent items
    const trimmed = history.slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save chat history:', error);
  }
}

export function getChatHistory(): ChatHistoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load chat history:', error);
    return [];
  }
}

export function clearChatHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear chat history:', error);
  }
}

export function deleteChatHistoryItem(id: string): void {
  try {
    const history = getChatHistory();
    const filtered = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete chat history item:', error);
  }
}

export function exportChatHistory(): void {
  const history = getChatHistory();
  const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kimi-k2-history-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface ThinkingStep {
  id: string;
  content: string;
  tokens: number;
  timestamp: number;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
  result?: any;
  status: 'pending' | 'success' | 'error';
  timestamp: number;
  error?: string;
}

export interface Metrics {
  thinkingTokens: number;
  toolCalls: number;
  elapsedTime: number;
  inputTokens: number;
  outputTokens: number;
}

export interface StreamEvent {
  type: 'thinking' | 'tool_call' | 'content' | 'metrics' | 'done' | 'error';
  data?: any;
}

export interface ApiResponse {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
      tool_calls?: Array<{
        id: string;
        type: string;
        function: {
          name: string;
          arguments: string;
        };
      }>;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ToolCall {
  id: string;
  name: string;
  inputs?: any;
  output?: string;
  status: 'running' | 'completed' | 'error';
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  status?: string;
  toolCalls?: ToolCall[];
}

export interface ChatState {
  messages: Message[];
  isProcessing: boolean;
  error: string | null;
}

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ToolCall {
  id: string;
  name: string;
  inputs?: any;
  output?: string;
  status: 'running' | 'completed' | 'error';
}

export interface Department {
  id: number;
  name: string;
  branding: {
    primary_color?: string;
    logo_url?: string | null;
    custom_greeting?: string;
  };
}

export interface User {
  id: number;
  email: string;
  name: string;
  character_class: string;
  xp_total: number;
  department_id?: number | null;
  department?: Department | null;
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

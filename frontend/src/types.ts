export type MessageRole = 'user' | 'assistant' | 'system';

export type AppView = 'chat' | 'workspace';

export interface ToolCall {
  id: string;
  name: string;
  inputs?: any;
  output?: string;
  status: 'running' | 'completed' | 'error';
}

export interface UserStats {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
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
  character_level: number;
  is_superuser: boolean;
  active_personality_id?: number | null;
  special_effects?: any;
  stats?: UserStats;
  titles?: string[];
  equipped_title?: string | null;
  login_streak: number;
  avatar_customization?: any;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  status?: string;
  toolCalls?: ToolCall[];
  sources?: string[];
}


export interface File {
  name: string;
  content: string;
  language: string; // 'javascript', 'html', 'css', 'json'
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  lastModified: string;
  files: Record<string, File>;
  status: 'idle' | 'building' | 'deployed' | 'error';
  deployedUrl?: string;
  chatHistory: ChatMessage[]; // Chat is now persisted per project
}

export interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'plus';
  avatar: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: string;
}

export interface AgentLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'thinking' | 'warning';
  step?: string;
}

export interface AgentTask {
  id: string;
  title: string;
  status: 'pending' | 'active' | 'completed' | 'failed' | 'skipped';
  streamContent?: string; // For real-time code visualization
}

export enum AgentStatus {
  IDLE = 'IDLE',
  ENHANCING = 'ENHANCING',
  PLANNING = 'PLANNING',
  CODING = 'CODING',
  READY = 'READY',
  PAUSED = 'PAUSED'
}

// Response format for the AI to perform file operations
export interface AgentFileAction {
  action: 'create' | 'update' | 'delete';
  path: string;
  content?: string;
}

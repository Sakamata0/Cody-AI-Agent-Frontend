export interface Message {
  role: "user" | "assistant";
  content: string;
  steps?: Step[];
  latency_ms?: number;
}

export interface Step {
  step: number;
  type: "action" | "observation" | "final_answer";
  tool?: string;
  input?: string | Record<string, unknown>;
  output?: string;
}

export interface Conversation {
  id: string;
  title: string;
  updated_at: string;
  message_count: number;
}

export interface ConversationDetail {
  id: string;
  title: string;
  messages: Message[];
  updated_at: string;
}

export interface ChatResponse {
  response: string;
  session_id: string;
  steps: Step[];
  latency_ms: number;
}

export interface HealthResponse {
  status: string;
  model: string;
  region: string;
  tools: number;
}

export interface ToolInfo {
  name: string;
  description: string;
}

// --- Auth Types ---

export interface User {
  user_id: string;
  email: string;
}

export interface TokenResponse {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
}

// --- Settings Types ---

export interface UserSettings {
  display_name: string;
  avatar_index: number | null;
  theme: "light" | "dark";
  language: "en" | "fr" | "ar";
}

export interface UserSettingsUpdate {
  display_name?: string;
  avatar_index?: number | null;
  theme?: "light" | "dark";
  language?: "en" | "fr" | "ar";
}

// --- Usage / Limits Types ---

export interface WeeklyUsage {
  messages_used: number;
  messages_limit: number;
  resets_at: string;
}

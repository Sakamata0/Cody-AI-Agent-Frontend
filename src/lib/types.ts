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

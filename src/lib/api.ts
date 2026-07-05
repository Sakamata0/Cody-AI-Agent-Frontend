import { ChatResponse, Conversation, ConversationDetail, HealthResponse, ToolInfo } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://13.48.126.141:8000";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export const api = {
  health(): Promise<HealthResponse> {
    return request("/health");
  },

  tools(): Promise<ToolInfo[]> {
    return request("/tools");
  },

  chat(message: string, sessionId: string | null): Promise<ChatResponse> {
    return request("/chat", {
      method: "POST",
      body: JSON.stringify({
        message,
        session_id: sessionId,
      }),
    });
  },

  chatStream(
    message: string,
    sessionId: string | null,
    onStep: (step: { event: string; data?: Record<string, unknown>; tool?: string }) => void,
    onDone: (response: ChatResponse & { session_id: string }) => void,
    onError: (error: string) => void,
  ): AbortController {
    const controller = new AbortController();

    fetch(`${BASE_URL}/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, session_id: sessionId }),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          onError(`API error: ${res.status}`);
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) return;

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.event === "done") {
                  onDone({
                    response: data.response,
                    session_id: data.session_id || sessionId || "",
                    steps: data.steps || [],
                    latency_ms: data.latency_ms || 0,
                  });
                } else if (data.event === "session") {
                  // Store session_id for later
                  if (data.session_id) {
                    onStep({ event: "session", data: { session_id: data.session_id } });
                  }
                } else {
                  onStep(data);
                }
              } catch {
                // skip malformed JSON
              }
            }
          }
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          onError(err.message);
        }
      });

    return controller;
  },

  getConversations(): Promise<Conversation[]> {
    return request("/conversations");
  },

  getConversation(id: string): Promise<ConversationDetail> {
    return request(`/conversations/${id}`);
  },

  deleteConversation(id: string): Promise<void> {
    return request(`/conversations/${id}`, { method: "DELETE" });
  },

  renameConversation(id: string, title: string): Promise<void> {
    return request(`/conversations/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ title }),
    });
  },
};

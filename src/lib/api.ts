import {
  ChatResponse,
  Conversation,
  ConversationDetail,
  HealthResponse,
  RegisterResponse,
  TokenResponse,
  ToolInfo,
  UserSettings,
  UserSettingsUpdate,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// --- Token Helpers ---

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access_token");
  localStorage.removeItem("id_token");
  localStorage.removeItem("refresh_token");
}

// --- Request Helpers ---

/** Flag to prevent multiple concurrent refresh attempts */
let isRefreshing = false;
let refreshPromise: Promise<TokenResponse> | null = null;

/**
 * Makes an authenticated request. Attaches Bearer token if available.
 * On 401: attempts token refresh, retries the request once.
 * If refresh fails: clears tokens and redirects to /login.
 */
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    // Attempt token refresh
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("No refresh token available");
    }

    try {
      const tokenResponse = await attemptRefresh(refreshToken);

      // Store new tokens
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", tokenResponse.access_token);
        localStorage.setItem("id_token", tokenResponse.id_token);
        if (tokenResponse.refresh_token) {
          localStorage.setItem("refresh_token", tokenResponse.refresh_token);
        }
      }

      // Retry the original request with the new token
      headers["Authorization"] = `Bearer ${tokenResponse.access_token}`;
      const retryRes = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!retryRes.ok) {
        throw new Error(`API error: ${retryRes.status} ${retryRes.statusText}`);
      }

      return retryRes.json();
    } catch {
      clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("Session expired. Please log in again.");
    }
  }

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * Attempts to refresh the access token. Deduplicates concurrent refresh calls.
 */
async function attemptRefresh(refreshToken: string): Promise<TokenResponse> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = requestPublic<TokenResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  }).finally(() => {
    isRefreshing = false;
    refreshPromise = null;
  });

  return refreshPromise;
}

/**
 * Makes a public request (no Bearer token attached).
 * Used for auth endpoints that don't require authentication.
 */
async function requestPublic<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    let message = `Error: ${res.status}`;
    try {
      const body = await res.json();
      if (body.detail) {
        message = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
      }
    } catch {
      // couldn't parse JSON, use default
    }
    throw new Error(message);
  }

  return res.json();
}

// --- API Object ---

export const api = {
  // --- Public Endpoints ---

  health(): Promise<HealthResponse> {
    return requestPublic("/health");
  },

  tools(): Promise<ToolInfo[]> {
    return requestPublic("/tools");
  },

  // --- Auth Endpoints (Public) ---

  register(email: string, password: string): Promise<RegisterResponse> {
    return requestPublic("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  verify(email: string, code: string): Promise<void> {
    return requestPublic("/auth/verify", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    });
  },

  login(email: string, password: string): Promise<TokenResponse> {
    return requestPublic("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  refresh(refreshToken: string): Promise<TokenResponse> {
    return requestPublic("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },

  // --- Auth Endpoints (Protected) ---

  logout(): Promise<void> {
    return request("/auth/logout", { method: "POST" });
  },

  // --- Settings Endpoints (Protected) ---

  getSettings(): Promise<UserSettings> {
    return request("/settings");
  },

  updateSettings(settings: UserSettingsUpdate): Promise<UserSettings> {
    return request("/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  },

  // --- Chat Endpoints (Protected) ---

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
    const token = getAccessToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    fetch(`${BASE_URL}/chat/stream`, {
      method: "POST",
      headers,
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

  // --- Conversation Endpoints (Protected) ---

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

"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Conversation, Message, Step } from "./types";
import { api } from "./api";
import { useAuth } from "./AuthContext";

interface ChatContextType {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  messagesLoading: boolean;
  conversationsLoading: boolean;
  sidebarOpen: boolean;
  showSearch: boolean;
  setSidebarOpen: (open: boolean) => void;
  setShowSearch: (show: boolean) => void;
  loadConversations: () => Promise<void>;
  loadConversation: (id: string) => Promise<void>;
  startNewChat: () => void;
  sendMessage: (content: string) => void;
  deleteConversation: (id: string) => Promise<void>;
  renameConversation: (id: string, title: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      setConversationsLoading(true);
      const convos = await api.getConversations();
      setConversations(convos);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadConversations();
    }
  }, [loadConversations, isAuthenticated, authLoading]);

  async function loadConversation(id: string) {
    try {
      setMessagesLoading(true);
      const data = await api.getConversation(id);
      setActiveConversationId(id);
      setMessages(data.messages || []);
      router.push(`/chats/${id}`);
    } catch (err) {
      console.error("Failed to load conversation:", err);
    } finally {
      setMessagesLoading(false);
    }
  }

  function startNewChat() {
    setActiveConversationId(null);
    setMessages([]);
    router.push("/");
  }

  function sendMessage(content: string) {
    const userMsg: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const placeholderMsg: Message = { role: "assistant", content: "", steps: [] };
    setMessages((prev) => [...prev, placeholderMsg]);

    api.chatStream(
      content,
      activeConversationId,
      (stepData) => {
        if (stepData.event === "session" && stepData.data?.session_id) {
          const newId = stepData.data.session_id as string;
          if (!activeConversationId) {
            setActiveConversationId(newId);
            // Update URL to the new conversation
            window.history.replaceState(null, "", `/chats/${newId}`);
          }
        } else if (stepData.event === "step") {
          setMessages((prev) => {
            const updated = prev.slice(0, -1);
            const last = prev[prev.length - 1];
            const step = stepData.data as unknown as Step;
            return [...updated, { ...last, steps: [...(last.steps || []), step] }];
          });
        } else if (stepData.event === "observation") {
          setMessages((prev) => {
            const updated = prev.slice(0, -1);
            const last = prev[prev.length - 1];
            const obs = stepData.data as unknown as Step;
            return [...updated, { ...last, steps: [...(last.steps || []), obs] }];
          });
        }
      },
      (response) => {
        setMessages((prev) => {
          const updated = prev.slice(0, -1);
          const last = prev[prev.length - 1];
          return [...updated, {
            ...last,
            content: response.response,
            steps: response.steps,
            latency_ms: response.latency_ms,
          }];
        });
        setIsLoading(false);
        loadConversations();
      },
      (error) => {
        setMessages((prev) => {
          const updated = prev.slice(0, -1);
          const last = prev[prev.length - 1];
          return [...updated, { ...last, content: "Sorry, something went wrong. Please try again." }];
        });
        setIsLoading(false);
        console.error("Stream error:", error);
      },
    );
  }

  async function deleteConversation(id: string) {
    try {
      await api.deleteConversation(id);
      if (activeConversationId === id) {
        startNewChat();
      }
      await loadConversations();
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  }

  async function renameConversation(id: string, title: string) {
    try {
      await api.renameConversation(id, title);
      await loadConversations();
    } catch (err) {
      console.error("Failed to rename conversation:", err);
    }
  }

  return (
    <ChatContext.Provider value={{
      conversations, activeConversationId, messages, isLoading,
      messagesLoading, conversationsLoading, sidebarOpen, showSearch, setSidebarOpen, setShowSearch,
      loadConversations, loadConversation, startNewChat, sendMessage,
      deleteConversation, renameConversation,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}

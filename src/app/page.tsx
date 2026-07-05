"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import ChatsPage from "@/components/ChatsPage";
import SearchModal from "@/components/SearchModal";
import { Conversation, Message } from "@/lib/types";
import { api } from "@/lib/api";

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [view, setView] = useState<"chat" | "chats">("chat");
  const [showSearch, setShowSearch] = useState(false);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations() {
    try {
      const convos = await api.getConversations();
      setConversations(convos);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  }

  async function loadConversation(id: string) {
    try {
      const data = await api.getConversation(id);
      setActiveConversationId(id);
      setMessages(data.messages || []);
      setView("chat");
    } catch (err) {
      console.error("Failed to load conversation:", err);
    }
  }

  function startNewChat() {
    setActiveConversationId(null);
    setMessages([]);
    setView("chat");
  }

  async function sendMessage(content: string) {
    const userMsg: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Add a placeholder assistant message that we'll update with steps
    const placeholderMsg: Message = {
      role: "assistant",
      content: "",
      steps: [],
    };
    setMessages((prev) => [...prev, placeholderMsg]);

    let streamSessionId = activeConversationId;

    api.chatStream(
      content,
      activeConversationId,
      // onStep - update the placeholder with live steps
      (stepData) => {
        if (stepData.event === "session" && stepData.data?.session_id) {
          streamSessionId = stepData.data.session_id as string;
          if (!activeConversationId) {
            setActiveConversationId(streamSessionId);
          }
        } else if (stepData.event === "step") {
          // New tool action
          setMessages((prev) => {
            const updated = prev.slice(0, -1);
            const last = prev[prev.length - 1];
            const step = stepData.data as unknown as import("@/lib/types").Step;
            return [...updated, { ...last, steps: [...(last.steps || []), step] }];
          });
        } else if (stepData.event === "observation") {
          // Observation for the last action
          setMessages((prev) => {
            const updated = prev.slice(0, -1);
            const last = prev[prev.length - 1];
            const obs = stepData.data as unknown as import("@/lib/types").Step;
            return [...updated, { ...last, steps: [...(last.steps || []), obs] }];
          });
        }
      },
      // onDone - replace placeholder with final response
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
      // onError
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
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        conversations={conversations}
        activeId={activeConversationId}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={startNewChat}
        onSelectConversation={loadConversation}
        onDeleteConversation={deleteConversation}
        onRenameConversation={renameConversation}
        onOpenChats={() => setView("chats")}
        onOpenSearch={() => setShowSearch(true)}
        currentView={view}
      />

      {view === "chat" ? (
        <ChatArea
          messages={messages}
          isLoading={isLoading}
          sidebarOpen={sidebarOpen}
          onSendMessage={sendMessage}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
      ) : (
        <ChatsPage
          conversations={conversations}
          sidebarOpen={sidebarOpen}
          onSelectConversation={loadConversation}
          onDeleteConversation={deleteConversation}
          onRenameConversation={renameConversation}
          onNewChat={startNewChat}
        />
      )}

      {showSearch && (
        <SearchModal
          conversations={conversations}
          onSelect={(id) => { loadConversation(id); setShowSearch(false); }}
          onClose={() => setShowSearch(false)}
        />
      )}
    </div>
  );
}

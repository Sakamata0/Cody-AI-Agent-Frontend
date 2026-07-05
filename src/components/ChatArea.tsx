"use client";

import { useRef, useEffect } from "react";
import { Message } from "@/lib/types";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import WelcomeScreen from "./WelcomeScreen";

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  sidebarOpen: boolean;
  onSendMessage: (message: string) => void;
  onToggleSidebar: () => void;
}

export default function ChatArea({
  messages,
  isLoading,
  sidebarOpen,
  onSendMessage,
  onToggleSidebar,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const hasMessages = messages.length > 0;

  return (
    <main
      className={`
        flex-1 flex flex-col h-screen
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? "ml-[260px]" : "ml-[48px]"}
      `}
    >
      {/* No top bar needed - sidebar always visible */}

      {/* Messages or Welcome */}
      <div className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          <WelcomeScreen onSendMessage={onSendMessage} />
        ) : (
          <div className="max-w-3xl mx-auto px-6 py-6 space-y-6 pt-15 pb-32">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}

            {/* Loading is now handled inside the last ChatMessage */}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input - sticky at bottom */}
      {hasMessages && (
        <div className="sticky bottom-0 bg-[var(--bg-primary)]">
          <div className="max-w-3xl mx-auto px-4">
            <ChatInput onSend={onSendMessage} isLoading={isLoading} />
            <p className="text-center text-xs text-[var(--text-muted)] my-2">
              Cody is AI and can make mistakes. Please double-check important information.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

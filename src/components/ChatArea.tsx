"use client";

import { useRef, useEffect } from "react";
import { Message } from "@/lib/types";
import { useTranslation } from "@/lib/useTranslation";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import WelcomeScreen from "./WelcomeScreen";

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  messagesLoading?: boolean;
  sidebarOpen: boolean;
  onSendMessage: (message: string) => void;
  onToggleSidebar: () => void;
}

export default function ChatArea({
  messages,
  isLoading,
  messagesLoading = false,
  sidebarOpen,
  onSendMessage,
  onToggleSidebar,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  // Track if we've been in a live streaming session (not loading from history)
  const wasStreamingRef = useRef(false);

  // When isLoading becomes true, mark that we're in a live stream
  useEffect(() => {
    if (isLoading) {
      wasStreamingRef.current = true;
    }
  }, [isLoading]);

  // Reset when conversation changes (messagesLoading = loading from history)
  useEffect(() => {
    if (messagesLoading) {
      wasStreamingRef.current = false;
    }
  }, [messagesLoading]);

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
        {messagesLoading ? (
          /* Skeleton while conversation loads */
          <div className="max-w-3xl mx-auto px-6 py-6 pt-15 pb-32 space-y-6 animate-pulse">
            {/* User message skeleton */}
            <div className="flex justify-end">
              <div className="h-10 w-[60%] rounded-2xl bg-[var(--bg-secondary)]" />
            </div>
            {/* Assistant message skeleton */}
            <div className="flex justify-start">
              <div className="max-w-[85%] space-y-3">
                <div className="w-7 h-7 rounded-full bg-[var(--bg-secondary)]" />
                <div className="space-y-2">
                  <div className="h-4 w-[90%] rounded bg-[var(--bg-secondary)]" />
                  <div className="h-4 w-[75%] rounded bg-[var(--bg-secondary)]" />
                  <div className="h-4 w-[60%] rounded bg-[var(--bg-secondary)]" />
                </div>
              </div>
            </div>
            {/* Another pair */}
            <div className="flex justify-end">
              <div className="h-10 w-[45%] rounded-2xl bg-[var(--bg-secondary)]" />
            </div>
            <div className="flex justify-start">
              <div className="max-w-[85%] space-y-3">
                <div className="w-7 h-7 rounded-full bg-[var(--bg-secondary)]" />
                <div className="space-y-2">
                  <div className="h-4 w-[85%] rounded bg-[var(--bg-secondary)]" />
                  <div className="h-4 w-[70%] rounded bg-[var(--bg-secondary)]" />
                </div>
              </div>
            </div>
          </div>
        ) : !hasMessages ? (
          <WelcomeScreen onSendMessage={onSendMessage} />
        ) : (
          <div className="max-w-3xl mx-auto px-6 py-6 space-y-6 pt-15 pb-32">
            {messages.map((msg, i) => (
              <ChatMessage
                key={i}
                message={msg}
                isLast={i === messages.length - 1 && msg.role === "assistant"}
                isLive={i === messages.length - 1 && msg.role === "assistant" && wasStreamingRef.current}
              />
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
              {t("chat.disclaimer")}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

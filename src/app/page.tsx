"use client";

import { useChat } from "@/lib/ChatContext";
import ChatArea from "@/components/ChatArea";

export default function Home() {
  const { messages, isLoading, sidebarOpen, sendMessage, stopGeneration, setSidebarOpen } = useChat();

  return (
    <ChatArea
      messages={messages}
      isLoading={isLoading}
      sidebarOpen={sidebarOpen}
      onSendMessage={sendMessage}
      onStop={stopGeneration}
      onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
    />
  );
}

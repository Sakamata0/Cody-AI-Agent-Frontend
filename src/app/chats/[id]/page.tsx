"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useChat } from "@/lib/ChatContext";
import ChatArea from "@/components/ChatArea";

export default function ConversationRoute() {
  const params = useParams();
  const id = params.id as string;
  const {
    messages, isLoading, messagesLoading, sidebarOpen, activeConversationId,
    sendMessage, setSidebarOpen, loadConversation,
  } = useChat();

  // Load the conversation if we navigate directly to this URL
  useEffect(() => {
    if (id && id !== activeConversationId) {
      loadConversation(id);
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Treat as loading if we have an id but conversation hasn't loaded yet
  const isLoadingConversation = messagesLoading || (id !== activeConversationId && messages.length === 0);

  return (
    <ChatArea
      messages={messages}
      isLoading={isLoading}
      messagesLoading={isLoadingConversation}
      sidebarOpen={sidebarOpen}
      onSendMessage={sendMessage}
      onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
    />
  );
}

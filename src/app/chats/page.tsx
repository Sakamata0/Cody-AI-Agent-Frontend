"use client";

import { useChat } from "@/lib/ChatContext";
import ChatsPage from "@/components/ChatsPage";

export default function ChatsRoute() {
  const {
    conversations, sidebarOpen, loadConversation,
    deleteConversation, renameConversation, startNewChat,
  } = useChat();

  return (
    <ChatsPage
      conversations={conversations}
      sidebarOpen={sidebarOpen}
      onSelectConversation={loadConversation}
      onDeleteConversation={deleteConversation}
      onRenameConversation={renameConversation}
      onNewChat={startNewChat}
    />
  );
}

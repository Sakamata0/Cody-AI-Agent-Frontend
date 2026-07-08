"use client";

import { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useChat } from "@/lib/ChatContext";
import { useAuth } from "@/lib/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Sidebar from "./Sidebar";
import SearchModal from "./SearchModal";

const AUTH_ROUTES = ["/login", "/register", "/verify", "/auth/callback", "/login/password"];

export default function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const {
    conversations, activeConversationId, sidebarOpen, showSearch,
    conversationsLoading, setSidebarOpen, setShowSearch, startNewChat,
    loadConversation, deleteConversation, renameConversation,
  } = useChat();

  // Auth pages don't get the sidebar or protected route wrapper
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          conversations={conversations}
          activeId={activeConversationId}
          isOpen={sidebarOpen}
          isLoadingConversations={conversationsLoading}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onNewChat={startNewChat}
          onSelectConversation={loadConversation}
          onDeleteConversation={deleteConversation}
          onRenameConversation={renameConversation}
          onOpenChats={() => router.push("/chats")}
          onOpenSearch={() => setShowSearch(true)}
          onLogout={logout}
          currentView="chat"
        />
        {children}
        {showSearch && (
          <SearchModal
            conversations={conversations}
            onSelect={(id) => { loadConversation(id); setShowSearch(false); }}
            onClose={() => setShowSearch(false)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

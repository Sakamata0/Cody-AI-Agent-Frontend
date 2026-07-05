"use client";

import { useState } from "react";
import { Conversation } from "@/lib/types";

interface ChatsPageProps {
  conversations: Conversation[];
  sidebarOpen: boolean;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, title: string) => void;
  onNewChat: () => void;
}

export default function ChatsPage({
  conversations,
  sidebarOpen,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  onNewChat,
}: ChatsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const filtered = searchQuery
    ? conversations.filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : conversations;

  function formatDate(dateStr: string) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7) return `${diff} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function handleRenameSubmit(id: string) {
    if (renameValue.trim()) {
      onRenameConversation(id, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue("");
  }

  return (
    <main
      className={`
        flex-1 flex flex-col h-screen
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? "ml-[260px]" : "ml-[48px]"}
      `}
    >
      <div className="max-w-4xl mx-auto w-full px-6 pt-16 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Chats</h1>
          <button
            onClick={onNewChat}
            className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            New chat
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="flex items-center gap-2.5 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-xl px-4 py-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none"
            />
          </div>
        </div>

        {/* Chat list */}
        <div className="space-y-0.5">
          {filtered.length === 0 ? (
            <p className="text-center text-[var(--text-muted)] text-sm mt-12">
              {searchQuery ? "No matching chats" : "No conversations yet"}
            </p>
          ) : (
            filtered.map((conv) => (
              <div key={conv.id} className="relative">
                {renamingId === conv.id ? (
                  <div className="flex items-center px-4 py-3 bg-[var(--bg-hover)] rounded-lg">
                    <input
                      autoFocus
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRenameSubmit(conv.id);
                        if (e.key === "Escape") { setRenamingId(null); setRenameValue(""); }
                      }}
                      onBlur={() => handleRenameSubmit(conv.id)}
                      className="flex-1 text-sm bg-transparent border-b border-[var(--accent)] text-[var(--text-primary)] outline-none py-0.5"
                    />
                  </div>
                ) : (
                  <div
                    onClick={() => onSelectConversation(conv.id)}
                    className="flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer hover:bg-[var(--bg-hover)] transition-colors duration-100 group"
                  >
                    <span className="text-sm text-[var(--text-primary)] truncate flex-1 mr-4">
                      {conv.title}
                    </span>
                    <div className="relative flex items-center">
                      <span className="text-xs text-[var(--text-muted)] group-hover:opacity-0 transition-opacity">
                        {formatDate(conv.updated_at)}
                      </span>
                      {/* 3-dot menu */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(menuOpenId === conv.id ? null : conv.id);
                        }}
                        className="absolute right-0 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] transition-opacity"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="5" r="2" />
                          <circle cx="12" cy="12" r="2" />
                          <circle cx="12" cy="19" r="2" />
                        </svg>
                      </button>
                    </div>

                    {/* Dropdown */}
                    {menuOpenId === conv.id && (
                      <div className="absolute right-4 top-full mt-1 z-50 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg shadow-xl py-1 min-w-[120px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRenamingId(conv.id);
                            setRenameValue(conv.title);
                            setMenuOpenId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                          </svg>
                          Rename
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(conv.id);
                            setMenuOpenId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-[var(--bg-hover)] transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Click outside to close menu */}
      {menuOpenId && (
        <div className="fixed inset-0 z-30" onClick={() => setMenuOpenId(null)} />
      )}
    </main>
  );
}

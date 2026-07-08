"use client";

import { useState } from "react";
import { Conversation } from "@/lib/types";
import AgentInfoModal from "./AgentInfoModal";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  isOpen: boolean;
  isLoadingConversations?: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, title: string) => void;
  onOpenChats: () => void;
  onOpenSearch: () => void;
  onLogout?: () => void;
  currentView: "chat" | "chats";
}

export default function Sidebar({
  conversations,
  activeId,
  isOpen,
  isLoadingConversations = false,
  onToggle,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  onOpenChats,
  onOpenSearch,
  onLogout,
  currentView,
}: SidebarProps) {
  const [showAgentInfo, setShowAgentInfo] = useState(false);
  const [showGroupBy, setShowGroupBy] = useState(false);
  const [groupBy, setGroupBy] = useState<"none" | "date">("none");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  function handleRenameSubmit(id: string) {
    if (renameValue.trim()) {
      onRenameConversation(id, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue("");
  }

  // Group conversations by date
  function groupByDate(convos: Conversation[]) {
    const today: Conversation[] = [];
    const yesterday: Conversation[] = [];
    const thisWeek: Conversation[] = [];
    const older: Conversation[] = [];

    const now = new Date();
    for (const conv of convos) {
      const date = new Date(conv.updated_at);
      const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 0) today.push(conv);
      else if (diff === 1) yesterday.push(conv);
      else if (diff < 7) thisWeek.push(conv);
      else older.push(conv);
    }
    return { today, yesterday, thisWeek, older };
  }

  const displayConversations = conversations.slice(0, 20);
  const grouped = groupByDate(displayConversations);

  return (
    <>
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full
          bg-[var(--bg-secondary)]
          flex flex-col transition-all duration-300 ease-in-out
          overflow-hidden whitespace-nowrap
          ${isOpen ? "w-[260px]" : "w-[48px]"}
        `}
      >
        {/* Top: Logo + Search + Collapse */}
        <div className={`flex items-center ${isOpen ? "justify-between px-4" : "justify-center"} py-4`}>
          {isOpen ? (
            <>
              <button onClick={onNewChat} className="flex items-center gap-2 cursor-pointer">
                <img src="/cody.png" alt="Cody" className="w-7 h-7 rounded-md" />
                <span className="font-semibold text-[var(--text-primary)] text-[15px]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Cody</span>
              </button>
              <div className="flex items-center gap-1">
                <button
                  onClick={onOpenSearch}
                  className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </button>
                <button
                  onClick={onToggle}
                  className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 3v18" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onToggle}
              className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18" />
              </svg>
            </button>
          )}
        </div>

        {/* Nav Items */}
        <nav className={`${isOpen ? "px-2" : "px-1"} space-y-0.5`}>
          <button
            onClick={onNewChat}
            className={`w-full flex items-center ${isOpen ? "gap-3 px-3" : "justify-center"} py-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-hover)] text-sm transition-colors`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            {isOpen && "New chat"}
          </button>

          <button
            onClick={onOpenChats}
            className={`w-full flex items-center ${isOpen ? "gap-3 px-3" : "justify-center"} py-2 rounded-lg text-sm transition-colors ${
              currentView === "chats"
                ? "bg-[var(--bg-hover)] text-[var(--text-primary)]"
                : "text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            {isOpen && "Chats"}
          </button>

          {!isOpen && (
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center justify-center py-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-hover)] text-sm transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
          )}
        </nav>

        {/* Recents - only when expanded */}
        {isOpen && (
        <div className="flex-1 overflow-y-auto mt-4">
          <div className="px-4 flex items-center justify-between mb-2 relative">
            <span className="text-xs text-[var(--text-muted)] font-medium">Recents</span>
            {/* Group by button */}
            <button
              onClick={() => setShowGroupBy(!showGroupBy)}
              className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 32 32" fill="currentColor">
                <path d="M29.000,13.858 L29.000,31.000 C29.000,31.553 28.553,32.000 28.000,32.000 C27.447,32.000 27.000,31.553 27.000,31.000 L27.000,13.858 C25.279,13.411 24.000,11.859 24.000,10.000 C24.000,8.141 25.279,6.589 27.000,6.142 L27.000,1.000 C27.000,0.447 27.447,0.000 28.000,0.000 C28.553,0.000 29.000,0.447 29.000,1.000 L29.000,6.142 C30.721,6.589 32.000,8.141 32.000,10.000 C32.000,11.859 30.721,13.411 29.000,13.858 ZM28.000,8.000 C26.898,8.000 26.000,8.897 26.000,10.000 C26.000,11.103 26.898,12.000 28.000,12.000 C29.103,12.000 30.000,11.103 30.000,10.000 C30.000,8.897 29.103,8.000 28.000,8.000 ZM17.000,25.858 L17.000,31.000 C17.000,31.553 16.553,32.000 16.000,32.000 C15.447,32.000 15.000,31.553 15.000,31.000 L15.000,25.858 C13.279,25.411 12.000,23.859 12.000,22.000 C12.000,20.141 13.279,18.589 15.000,18.142 L15.000,1.000 C15.000,0.447 15.447,0.000 16.000,0.000 C16.553,0.000 17.000,0.447 17.000,1.000 L17.000,18.142 C18.721,18.589 20.000,20.141 20.000,22.000 C20.000,23.859 18.721,25.411 17.000,25.858 ZM16.000,20.000 C14.897,20.000 14.000,20.898 14.000,22.000 C14.000,23.102 14.897,24.000 16.000,24.000 C17.103,24.000 18.000,23.102 18.000,22.000 C18.000,20.898 17.103,20.000 16.000,20.000 ZM5.000,19.858 L5.000,31.000 C5.000,31.553 4.553,32.000 4.000,32.000 C3.447,32.000 3.000,31.553 3.000,31.000 L3.000,19.858 C1.279,19.411 0.000,17.859 0.000,16.000 C0.000,14.141 1.279,12.589 3.000,12.142 L3.000,1.000 C3.000,0.447 3.447,0.000 4.000,0.000 C4.553,0.000 5.000,0.447 5.000,1.000 L5.000,12.142 C6.721,12.589 8.000,14.141 8.000,16.000 C8.000,17.859 6.721,19.411 5.000,19.858 ZM4.000,14.000 C2.898,14.000 2.000,14.898 2.000,16.000 C2.000,17.103 2.898,18.000 4.000,18.000 C5.102,18.000 6.000,17.103 6.000,16.000 C6.000,14.898 5.102,14.000 4.000,14.000 Z" />
              </svg>
            </button>

            {/* Group by dropdown */}
            {showGroupBy && (
              <div className="absolute right-0 top-full mt-1 z-50 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg shadow-xl py-1 min-w-[140px]">
                <p className="px-3 py-1.5 text-xs text-[var(--text-muted)]">Group by</p>
                <button
                  onClick={() => { setGroupBy("none"); setShowGroupBy(false); }}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  None
                  {groupBy === "none" && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => { setGroupBy("date"); setShowGroupBy(false); }}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  Date
                  {groupBy === "date" && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="px-2 space-y-0.5">
            {isLoadingConversations ? (
              /* Skeleton loading */
              <div className="space-y-1 animate-pulse">
                {[75, 60, 85, 70, 90, 65].map((w, i) => (
                  <div key={i} className="flex items-center px-3 py-2">
                    <div className="h-4 rounded bg-[var(--bg-tertiary)]" style={{ width: `${w}%` }} />
                  </div>
                ))}
              </div>
            ) : groupBy === "none" ? (
              // Flat list
              displayConversations.map((conv) => (
                <RecentItem
                  key={conv.id}
                  conv={conv}
                  isActive={activeId === conv.id}
                  menuOpenId={menuOpenId}
                  renamingId={renamingId}
                  renameValue={renameValue}
                  setMenuOpenId={setMenuOpenId}
                  setRenamingId={setRenamingId}
                  setRenameValue={setRenameValue}
                  onSelect={onSelectConversation}
                  onDelete={onDeleteConversation}
                  onRenameSubmit={handleRenameSubmit}
                />
              ))
            ) : (
              // Grouped by date
              <>
                <GroupLabel label="Today" convos={grouped.today} activeId={activeId} menuOpenId={menuOpenId} renamingId={renamingId} renameValue={renameValue} setMenuOpenId={setMenuOpenId} setRenamingId={setRenamingId} setRenameValue={setRenameValue} onSelect={onSelectConversation} onDelete={onDeleteConversation} onRenameSubmit={handleRenameSubmit} />
                <GroupLabel label="Yesterday" convos={grouped.yesterday} activeId={activeId} menuOpenId={menuOpenId} renamingId={renamingId} renameValue={renameValue} setMenuOpenId={setMenuOpenId} setRenamingId={setRenamingId} setRenameValue={setRenameValue} onSelect={onSelectConversation} onDelete={onDeleteConversation} onRenameSubmit={handleRenameSubmit} />
                <GroupLabel label="This week" convos={grouped.thisWeek} activeId={activeId} menuOpenId={menuOpenId} renamingId={renamingId} renameValue={renameValue} setMenuOpenId={setMenuOpenId} setRenamingId={setRenamingId} setRenameValue={setRenameValue} onSelect={onSelectConversation} onDelete={onDeleteConversation} onRenameSubmit={handleRenameSubmit} />
                <GroupLabel label="Older" convos={grouped.older} activeId={activeId} menuOpenId={menuOpenId} renamingId={renamingId} renameValue={renameValue} setMenuOpenId={setMenuOpenId} setRenamingId={setRenamingId} setRenameValue={setRenameValue} onSelect={onSelectConversation} onDelete={onDeleteConversation} onRenameSubmit={handleRenameSubmit} />
              </>
            )}
            {!isLoadingConversations && conversations.length === 0 && (
              <p className="text-xs text-[var(--text-muted)] px-3 mt-4">No conversations yet</p>
            )}
          </div>
        </div>
        )}

        {/* Spacer */}
        {!isOpen && <div className="flex-1" />}

        {/* Bottom: Agent Info + Logout */}
        <div className={`${isOpen ? "px-3" : "px-1"} py-3 space-y-1`}>
          <button
            onClick={() => setShowAgentInfo(true)}
            className={`w-full flex items-center ${isOpen ? "gap-2.5 px-3" : "justify-center"} py-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] text-sm transition-colors`}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a7 7 0 100 14 7 7 0 000-14zm-9 7a9 9 0 1118 0 9 9 0 01-18 0zm8-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm.01 8a1 1 0 102 0V9a1 1 0 10-2 0v5z" />
            </svg>
            {isOpen && "Agent Info"}
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className={`w-full flex items-center ${isOpen ? "gap-2.5 px-3" : "justify-center"} py-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-red-400 text-sm transition-colors`}
              aria-label="Logout"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              {isOpen && "Logout"}
            </button>
          )}
        </div>
      </aside>

      {showAgentInfo && <AgentInfoModal onClose={() => setShowAgentInfo(false)} />}
      {(showGroupBy || menuOpenId) && (
        <div className="fixed inset-0 z-30" onClick={() => { setShowGroupBy(false); setMenuOpenId(null); }} />
      )}
    </>
  );
}

/* Single recent conversation item with 3-dot menu */
function RecentItem({
  conv, isActive, menuOpenId, renamingId, renameValue,
  setMenuOpenId, setRenamingId, setRenameValue,
  onSelect, onDelete, onRenameSubmit,
}: {
  conv: Conversation;
  isActive: boolean;
  menuOpenId: string | null;
  renamingId: string | null;
  renameValue: string;
  setMenuOpenId: (id: string | null) => void;
  setRenamingId: (id: string | null) => void;
  setRenameValue: (val: string) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRenameSubmit: (id: string) => void;
}) {
  if (renamingId === conv.id) {
    return (
      <div className="px-3 py-1.5">
        <input
          autoFocus
          type="text"
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onRenameSubmit(conv.id);
            if (e.key === "Escape") { setRenamingId(null); setRenameValue(""); }
          }}
          onBlur={() => onRenameSubmit(conv.id)}
          className="w-full text-sm bg-[var(--bg-tertiary)] border border-[var(--accent)] rounded-md px-2 py-1 text-[var(--text-primary)] outline-none"
        />
      </div>
    );
  }

  return (
    <div
      className={`
        group relative flex items-center rounded-lg px-3 py-1.5 cursor-pointer
        transition-colors duration-100
        ${isActive
          ? "bg-[var(--bg-hover)] text-[var(--text-primary)]"
          : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
        }
      `}
      onClick={() => onSelect(conv.id)}
    >
      <span className="flex-1 text-sm truncate">{conv.title}</span>

      {/* 3-dot menu on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpenId(menuOpenId === conv.id ? null : conv.id);
        }}
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] transition-opacity"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>

      {/* Dropdown */}
      {menuOpenId === conv.id && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg shadow-xl py-1 min-w-[110px]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setRenamingId(conv.id);
              setRenameValue(conv.title);
              setMenuOpenId(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
            Rename
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(conv.id);
              setMenuOpenId(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-[var(--bg-hover)] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

/* Group label + items */
function GroupLabel({
  label, convos, activeId, menuOpenId, renamingId, renameValue,
  setMenuOpenId, setRenamingId, setRenameValue,
  onSelect, onDelete, onRenameSubmit,
}: {
  label: string;
  convos: Conversation[];
  activeId: string | null;
  menuOpenId: string | null;
  renamingId: string | null;
  renameValue: string;
  setMenuOpenId: (id: string | null) => void;
  setRenamingId: (id: string | null) => void;
  setRenameValue: (val: string) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRenameSubmit: (id: string) => void;
}) {
  if (convos.length === 0) return null;
  return (
    <div className="mb-2">
      <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider px-3 py-1">{label}</p>
      {convos.map((conv) => (
        <RecentItem
          key={conv.id}
          conv={conv}
          isActive={activeId === conv.id}
          menuOpenId={menuOpenId}
          renamingId={renamingId}
          renameValue={renameValue}
          setMenuOpenId={setMenuOpenId}
          setRenamingId={setRenamingId}
          setRenameValue={setRenameValue}
          onSelect={onSelect}
          onDelete={onDelete}
          onRenameSubmit={onRenameSubmit}
        />
      ))}
    </div>
  );
}

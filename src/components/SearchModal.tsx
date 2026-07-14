"use client";

import { useState, useRef, useEffect } from "react";
import { Conversation } from "@/lib/types";
import { useTranslation } from "@/lib/useTranslation";

interface SearchModalProps {
  conversations: Conversation[];
  onSelect: (id: string) => void;
  onClose: () => void;
}

export default function SearchModal({ conversations, onSelect, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const filtered = query
    ? conversations.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()))
    : conversations;

  function formatDate(dateStr: string) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 30) return t("search.pastMonth");
    return t("search.pastYear");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder={t("search.placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm outline-none"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-center text-[var(--text-muted)] text-sm py-8">
              {query ? t("search.noMatchingChats") : t("search.noConversations")}
            </p>
          ) : (
            <div className="py-1">
              {filtered.map((conv, i) => (
                <button
                  key={conv.id}
                  onClick={() => onSelect(conv.id)}
                  className={`
                    w-full flex items-center justify-between px-5 py-3 text-left
                    hover:bg-[var(--bg-hover)] transition-colors
                    ${i === 0 && query ? "bg-[var(--bg-hover)]" : ""}
                  `}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Chat icon placeholder */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" className="shrink-0">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                    <span className="text-sm text-[var(--text-primary)] truncate">{conv.title}</span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] shrink-0 ml-4">
                    {i === 0 && query ? "Enter" : formatDate(conv.updated_at)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

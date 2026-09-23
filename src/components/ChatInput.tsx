"use client";

import { useState, useRef, useEffect } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
  onStop?: () => void;
}

export default function ChatInput({ onSend, isLoading, placeholder, onStop }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    }
  }, [input]);

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="
        flex items-center gap-2 
        bg-[var(--bg-secondary)] border border-[var(--border)]
        rounded-2xl px-4 py-3
        focus-within:border-[var(--accent)]/50
        transition-colors duration-150
      ">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Write a message..."}
          disabled={isLoading}
          rows={1}
          className="
            flex-1 bg-transparent resize-none outline-none
            text-[var(--text-primary)] placeholder-[var(--text-muted)]
            text-sm leading-6 max-h-[200px]
          "
        />
        {isLoading && onStop ? (
          <button
            type="button"
            onClick={onStop}
            className="
              shrink-0 w-8 h-8 rounded-lg
              flex items-center justify-center
              bg-red-500 hover:bg-red-600
              transition-all duration-150
            "
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <rect x="5" y="5" width="14" height="14" rx="2" />
            </svg>
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="
              shrink-0 w-8 h-8 rounded-lg
              flex items-center justify-center
              bg-[var(--accent)] hover:bg-[var(--accent-hover)]
              disabled:opacity-30 disabled:cursor-not-allowed
              transition-all duration-150
            "
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5" />
              <path d="M5 12l7-7 7 7" />
            </svg>
          </button>
        )}
      </div>
    </form>
  );
}

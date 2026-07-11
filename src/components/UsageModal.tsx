"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { WeeklyUsage } from "@/lib/types";

interface UsageModalProps {
  onClose: () => void;
}

export default function UsageModal({ onClose }: UsageModalProps) {
  const [usage, setUsage] = useState<WeeklyUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getUsage()
      .then(setUsage)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load usage"))
      .finally(() => setLoading(false));
  }, []);

  const messagesUsed = usage?.messages_used ?? 0;
  const messagesLimit = usage?.messages_limit ?? 50;
  const remaining = messagesLimit - messagesUsed;
  const percentage = Math.min((messagesUsed / messagesLimit) * 100, 100);

  // Format reset date
  const resetsAt = usage?.resets_at
    ? new Date(usage.resets_at).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl w-full max-w-md">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors z-10"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Weekly usage</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Your message limit resets every week.
            </p>
          </div>

          {loading ? (
            /* Skeleton */
            <div className="space-y-4 animate-pulse">
              <div className="flex justify-between">
                <div className="h-4 w-20 rounded bg-[var(--bg-tertiary)]" />
                <div className="h-4 w-16 rounded bg-[var(--bg-tertiary)]" />
              </div>
              <div className="h-2.5 w-full rounded-full bg-[var(--bg-tertiary)]" />
              <div className="h-4 w-40 rounded bg-[var(--bg-tertiary)]" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-16 rounded-lg bg-[var(--bg-tertiary)]" />
                <div className="h-16 rounded-lg bg-[var(--bg-tertiary)]" />
              </div>
            </div>
          ) : error ? (
            <p className="text-sm text-red-400">{error}</p>
          ) : (
            <>
              {/* Usage bar */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Messages</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {messagesUsed} / {messagesLimit}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      percentage >= 90
                        ? "bg-red-400"
                        : percentage >= 70
                        ? "bg-yellow-400"
                        : "bg-[var(--accent)]"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Reset info */}
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>Resets on {resetsAt}</span>
                </div>
              </div>

              {/* Usage breakdown */}
              <div className="border-t border-[var(--border)] pt-4 space-y-3">
                <h3 className="text-sm font-medium text-[var(--text-primary)]">This week</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[var(--bg-tertiary)] rounded-lg p-3">
                    <p className="text-lg font-semibold text-[var(--text-primary)]">{messagesUsed}</p>
                    <p className="text-xs text-[var(--text-muted)]">Messages sent</p>
                  </div>
                  <div className="bg-[var(--bg-tertiary)] rounded-lg p-3">
                    <p className="text-lg font-semibold text-[var(--text-primary)]">{remaining}</p>
                    <p className="text-xs text-[var(--text-muted)]">Remaining</p>
                  </div>
                </div>
              </div>

              {/* Contact support */}
              <div className="border-t border-[var(--border)] pt-4">
                <p className="text-sm text-[var(--text-secondary)] mb-3">
                  Need more messages? Contact support to extend your weekly limit.
                </p>
                <a
                  href="mailto:support@smartovate.com?subject=Usage%20Limit%20Extension%20Request"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] text-sm font-medium transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  Contact support
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

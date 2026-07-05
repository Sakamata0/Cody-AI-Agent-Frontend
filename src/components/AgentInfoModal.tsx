"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { HealthResponse, ToolInfo } from "@/lib/types";

interface AgentInfoModalProps {
  onClose: () => void;
}

export default function AgentInfoModal({ onClose }: AgentInfoModalProps) {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [tools, setTools] = useState<ToolInfo[]>([]);

  useEffect(() => {
    api.health().then(setHealth).catch(console.error);
    api.tools().then(setTools).catch(console.error);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl w-full max-w-md p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <img src="/cody.png" alt="Cody" className="w-10 h-10 rounded-lg" />
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Cody</h2>
            <p className="text-sm text-[var(--text-secondary)]">SMARTOVATE AI Agent</p>
          </div>
        </div>

        {/* Info */}
        {health && (
          <div className="space-y-3 mb-5">
            <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
              <span className="text-sm text-[var(--text-secondary)]">Status</span>
              <span className="text-sm font-medium text-green-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                {health.status}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
              <span className="text-sm text-[var(--text-secondary)]">Model</span>
              <span className="text-sm font-mono text-[var(--text-primary)]">Claude Haiku 4.5</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
              <span className="text-sm text-[var(--text-secondary)]">Region</span>
              <span className="text-sm font-mono text-[var(--text-primary)]">{health.region}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
              <span className="text-sm text-[var(--text-secondary)]">Tools</span>
              <span className="text-sm font-medium text-[var(--text-primary)]">{health.tools} available</span>
            </div>
          </div>
        )}

        {/* Tools list */}
        {tools.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Available Tools</h3>
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
              {tools.map((tool) => (
                <div key={tool.name} className="flex items-start gap-2 py-1.5">
                  <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--accent)] shrink-0">
                    {tool.name}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] line-clamp-1">
                    {tool.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-[var(--border)] text-center">
          <p className="text-xs text-[var(--text-muted)]">
            Built by Skander Boughnimi • SMARTOVATE LTD © 2025
          </p>
        </div>
      </div>
    </div>
  );
}

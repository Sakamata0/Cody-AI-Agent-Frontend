"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message, Step } from "@/lib/types";
import CodyAvatar from "./CodyAvatar";

interface ChatMessageProps {
  message: Message;
  isLast?: boolean;
}

const TOOL_LABELS: Record<string, { label: string; icon: string }> = {
  web_search: { label: "Searched the web", icon: "🔍" },
  sql_query: { label: "Queried the database", icon: "🗄️" },
  weather_tool: { label: "Checked weather", icon: "🌤️" },
  exchange_rate_tool: { label: "Converted currency", icon: "💱" },
  code_executor_tool: { label: "Executed code", icon: "💻" },
  disaster_predictor_tool: { label: "Analyzed disaster risk", icon: "🌪️" },
};

export default function ChatMessage({ message, isLast = false }: ChatMessageProps) {
  const isUser = message.role === "user";

  const actionSteps = message.steps?.filter((s) => s.type === "action") || [];
  const hasSteps = actionSteps.length > 0;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {isUser ? (
        <div className="max-w-[85%]">
          <div className="rounded-2xl px-4 py-3 text-sm leading-relaxed bg-[var(--user-bubble)] text-[var(--text-primary)] rounded-br-md">
            <div className="whitespace-pre-wrap break-words">{message.content}</div>
          </div>
        </div>
      ) : (
        <div className="max-w-[85%] space-y-3">
          {/* Avatar — animates only on the last message */}
          <CodyAvatar className="w-7 h-7" animate={isLast} />

          {/* Reasoning Timeline (shown above the answer) */}
          {hasSteps && (
            <ReasoningTimeline steps={message.steps!} hasContent={!!message.content} />
          )}

          {/* Final answer (or typing indicator if still loading) */}
          {message.content ? (
            <div className="text-sm leading-relaxed text-[var(--text-primary)]">
              <div className="markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1 py-2">
              <span className="typing-dot w-2 h-2 rounded-full bg-[var(--text-muted)]"></span>
              <span className="typing-dot w-2 h-2 rounded-full bg-[var(--text-muted)]"></span>
              <span className="typing-dot w-2 h-2 rounded-full bg-[var(--text-muted)]"></span>
            </div>
          )}

          {/* Latency */}
          {message.latency_ms && (
            <span className="text-xs text-[var(--text-muted)]">
              Elapsed time: {formatLatency(message.latency_ms)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function ReasoningTimeline({ steps, hasContent }: { steps: Step[]; hasContent: boolean }) {
  // Group steps into action+observation pairs, deduplicating same tool calls
  const pairs: { action: Step; observation?: Step }[] = [];
  const seenTools = new Set<string>();

  for (let i = 0; i < steps.length; i++) {
    if (steps[i].type === "action") {
      const toolKey = steps[i].tool || "";
      const obs = steps[i + 1]?.type === "observation" ? steps[i + 1] : undefined;

      if (!seenTools.has(toolKey)) {
        seenTools.add(toolKey);
        pairs.push({ action: steps[i], observation: obs });
      }
      if (obs) i++;
    }
  }

  if (pairs.length === 0) return null;

  // "Done" only shows when the final answer has arrived
  const isDone = hasContent;

  return (
    <div className="space-y-0">
      {pairs.map((pair, i) => (
        <TimelineStep
          key={i}
          pair={pair}
          isLast={i === pairs.length - 1}
          autoExpand={!isDone}
        />
      ))}

      {/* Done indicator - only show when final answer is ready */}
      {isDone && (
        <div className="relative pl-6">
          <div className="absolute left-1 top-1 w-3.5 h-3.5 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <span className="text-sm text-[var(--text-muted)]">Done</span>
        </div>
      )}
    </div>
  );
}

function TimelineStep({ pair, isLast, autoExpand }: { pair: { action: Step; observation?: Step }; isLast: boolean; autoExpand: boolean }) {
  const [manualToggle, setManualToggle] = useState<boolean | null>(null);

  // Auto-expand when observation arrives during streaming, collapse when done
  const expanded = manualToggle !== null ? manualToggle : (autoExpand && !!pair.observation);

  const toolInfo = TOOL_LABELS[pair.action.tool || ""] || {
    label: `Used ${pair.action.tool}`,
    icon: "⚙️",
  };

  return (
    <div className="relative pl-6 pb-3">
      {/* Timeline line */}
      <div className="absolute left-[11px] top-6 bottom-0 w-px bg-[var(--border)]" />

      {/* Timeline dot */}
      <div className="absolute left-1 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-[var(--border)] bg-[var(--bg-primary)]" />

      {/* Step content */}
      <div>
        {/* Tool action header - clickable to expand */}
        <button
          onClick={() => setManualToggle(expanded ? false : true)}
          className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <span>{toolInfo.icon}</span>
          <span>{toolInfo.label}</span>
          {pair.observation && (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transition-transform duration-200 text-[var(--text-muted)] ${expanded ? "rotate-90" : ""}`}
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          )}
        </button>

        {/* Expanded details */}
        {expanded && pair.observation && (
          <div
            style={{ animation: "fadeIn 0.25s ease-out" }}
            className="mt-2 px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-xs overflow-x-auto max-h-[300px] overflow-y-auto"
          >
            <FormattedObservation tool={pair.action.tool || ""} output={pair.observation.output || ""} />
          </div>
        )}
      </div>
    </div>
  );
}

/* Format tool output based on tool type */
function FormattedObservation({ tool, output }: { tool: string; output: string }) {
  // Web search - parse as source links
  if (tool === "web_search") {
    try {
      // Try to parse as JSON array of results
      const results = JSON.parse(output.replace(/'/g, '"').replace(/None/g, 'null'));
      if (Array.isArray(results)) {
        return (
          <div className="space-y-2">
            {results.map((r: { title?: string; url?: string; content?: string }, i: number) => (
              <div key={i} className="space-y-0.5">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent)] hover:underline font-medium"
                >
                  {r.title || r.url}
                </a>
                {r.content && (
                  <p className="text-[var(--text-muted)] text-xs line-clamp-2">{r.content}</p>
                )}
              </div>
            ))}
          </div>
        );
      }
    } catch {
      // If parsing fails, try regex extraction
      const urlRegex = /'url':\s*'([^']+)'/g;
      const titleRegex = /'title':\s*'([^']+)'/g;
      const urls: string[] = [];
      const titles: string[] = [];
      let match;
      while ((match = urlRegex.exec(output)) !== null) urls.push(match[1]);
      while ((match = titleRegex.exec(output)) !== null) titles.push(match[1]);

      if (urls.length > 0) {
        return (
          <div className="space-y-1.5">
            {urls.map((url, i) => (
              <div key={i}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent)] hover:underline text-xs"
                >
                  {titles[i] || url}
                </a>
              </div>
            ))}
          </div>
        );
      }
    }
  }

  // Default: show as pre-formatted text
  return (
    <pre className="text-[var(--text-secondary)] whitespace-pre-wrap break-words text-xs leading-relaxed">
      {output}
    </pre>
  );
}

function formatLatency(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 1) return `${Math.round(ms)}ms`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes === 0) return `${secs}s`;
  return `${minutes}m ${secs}s`;
}

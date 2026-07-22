"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message, Step } from "@/lib/types";
import CodyAvatar from "./CodyAvatar";

// Custom event to open modals from anywhere
export const openUsageModal = () => window.dispatchEvent(new CustomEvent("open-usage-modal"));

// Copy button for code blocks
function CodeBlock({ children, className }: { children: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(children.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [children]);

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
      >
        {copied ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            Copy
          </>
        )}
      </button>
      <pre className={className}>
        <code>{children}</code>
      </pre>
    </div>
  );
}

// Thinking animation: synced with aura pulse (2.4s cycle)
// thinking -> thinking. -> thinking.. -> thinking... (each step = 600ms, full cycle = 2.4s)
function ThinkingText() {
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDots((prev) => (prev + 1) % 4);
    }, 600);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="text-sm text-[var(--text-muted)] italic">
      thinking{".".repeat(dots)}
    </span>
  );
}

// Custom markdown components with copy button on code blocks
const markdownComponents: Components = {
  pre({ children }) {
    // Extract code content from the <code> child
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const codeElement = children as any;
    if (codeElement?.props?.children) {
      const code = String(codeElement.props.children).replace(/\n$/, "");
      const className = codeElement.props.className || "";
      return <CodeBlock className={className}>{code}</CodeBlock>;
    }
    return <pre>{children}</pre>;
  },
};
export const openContactSupport = () => {
  window.location.href = "mailto:support@smartovate.com?subject=Usage%20Limit%20Extension%20Request";
};

interface ChatMessageProps {
  message: Message;
  isLast?: boolean;
  isLive?: boolean;
}

const TOOL_LABELS: Record<string, { label: string; icon: string }> = {
  web_search: { label: "Searched the web", icon: "🔍" },
  sql_query: { label: "Queried the database", icon: "🗄️" },
  weather_tool: { label: "Checked weather", icon: "🌤️" },
  exchange_rate_tool: { label: "Converted currency", icon: "💱" },
  code_executor_tool: { label: "Executed code", icon: "💻" },
  disaster_predictor_tool: { label: "Analyzed disaster risk", icon: "🌪️" },
};

export default function ChatMessage({ message, isLast = false, isLive = false }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isRateLimited = message.content?.includes("__RATE_LIMITED__");

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
          {/* Avatar — pulses only while thinking (no content yet) */}
          <div className="flex items-center gap-2">
            <CodyAvatar className="w-7 h-7" animate={isLast && !message.content} showAura={isLast && !message.content} />
            {isLast && !message.content && <ThinkingText />}
          </div>

          {/* Reasoning Timeline (shown above the answer) */}
          {hasSteps && (
            <ReasoningTimeline steps={message.steps!} hasContent={!!message.content} />
          )}

          {/* Final answer (or typing indicator if still loading) */}
          {message.content && (
            <div className="text-sm leading-relaxed text-[var(--text-primary)]">
              {isRateLimited ? (
                <RateLimitMessage />
              ) : (
                <div className="markdown-content">
                  {isLast && isLive ? (
                    <TypewriterMarkdown content={message.content} />
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{message.content}</ReactMarkdown>
                  )}
                </div>
              )}
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

function RateLimitMessage() {
  return (
    <div className="space-y-2">
      <p className="text-[var(--text-secondary)]">
        You&apos;ve reached your{" "}
        <button
          onClick={openUsageModal}
          className="text-[var(--accent)] hover:underline cursor-pointer font-medium"
        >
          weekly message limit
        </button>
        .
      </p>
      <p className="text-[var(--text-muted)] text-xs">
        <button
          onClick={openContactSupport}
          className="text-[var(--accent)] hover:underline cursor-pointer"
        >
          Contact support
        </button>
        {" "}to extend your limit.
      </p>
    </div>
  );
}

function TypewriterMarkdown({ content }: { content: string }) {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [done, setDone] = useState(false);
  const prevContentRef = useRef("");

  // When content changes from what we had, start the animation
  useEffect(() => {
    if (content && content !== prevContentRef.current) {
      // New content arrived — reset and animate
      prevContentRef.current = content;
      setDisplayedLength(0);
      setDone(false);
    }
  }, [content]);

  useEffect(() => {
    if (done || !content || displayedLength >= content.length) return;

    const charsPerTick = 8;
    const interval = 16;

    const timer = setInterval(() => {
      setDisplayedLength((prev) => {
        const next = prev + charsPerTick;
        if (next >= content.length) {
          setDone(true);
          clearInterval(timer);
          return content.length;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [content, done, displayedLength]);

  if (done) {
    return <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{content}</ReactMarkdown>;
  }

  const partial = content.slice(0, displayedLength);
  return <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{partial || " "}</ReactMarkdown>;
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

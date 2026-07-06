"use client";

import { useState } from "react";
import ChatInput from "./ChatInput";
import CodyAvatar from "./CodyAvatar";
import { PredictIcon, AnalyzeIcon, ConvertIcon, SearchIcon, WeatherIcon } from "./icons/ToolIcons";

interface WelcomeScreenProps {
  onSendMessage: (message: string) => void;
}

interface SuggestionCategory {
  label: string;
  icon: React.ReactNode;
  prompts: string[];
}

const SUGGESTIONS: SuggestionCategory[] = [
  {
    label: "Predict",
    icon: <PredictIcon className="w-3.5 h-3.5" />,
    prompts: [
      "What's the tornado risk in Oklahoma for 2027?",
      "Predict earthquakes in Japan next 6 months",
      "Hurricane forecast for the Atlantic 2027-2028",
      "Tornado risk in Texas this month",
    ],
  },
  {
    label: "Analyze",
    icon: <AnalyzeIcon className="w-3.5 h-3.5" />,
    prompts: [
      "Show me all employees in the Engineering department",
      "What's the total budget across all departments?",
      "List projects that are currently in progress",
      "Who are the highest paid employees?",
    ],
  },
  {
    label: "Convert",
    icon: <ConvertIcon className="w-3.5 h-3.5" />,
    prompts: [
      "Convert 500 EUR to TND",
      "What's the exchange rate USD to JPY?",
      "Convert 1000 GBP to USD",
      "How much is 200 CAD in EUR?",
    ],
  },
  {
    label: "Search",
    icon: <SearchIcon className="w-3.5 h-3.5" />,
    prompts: [
      "What's the latest news about AI?",
      "Search for AWS Bedrock pricing",
      "Find information about Prophet forecasting library",
      "What's happening in tech today?",
    ],
  },
  {
    label: "Weather",
    icon: <WeatherIcon className="w-3.5 h-3.5" />,
    prompts: [
      "What's the weather in Tunis?",
      "Current weather in London",
      "Temperature in Tokyo right now",
      "Weather forecast for Paris",
    ],
  },
];

export default function WelcomeScreen({ onSendMessage }: WelcomeScreenProps) {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [hoveredPrompt, setHoveredPrompt] = useState<string | null>(null);

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  function handleCategoryClick(label: string) {
    setOpenCategory(openCategory === label ? null : label);
    setHoveredPrompt(null);
  }

  function handlePromptClick(prompt: string) {
    setOpenCategory(null);
    setHoveredPrompt(null);
    onSendMessage(prompt);
  }

  const activeCategory = SUGGESTIONS.find((s) => s.label === openCategory);

  return (
    <div className="flex flex-col items-center h-full px-4 pt-[25vh]">
      <div className="max-w-2xl w-full space-y-6">
        {/* Greeting */}
        <div className="text-center space-y-2 mb-8">
          <CodyAvatar className="w-12 h-12 mx-auto mb-3" animate={true} />
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            {getGreeting()}
          </h1>
          <p className="text-[var(--text-secondary)]">
            How can I help you today?
          </p>
        </div>

        {/* Input - shows hovered prompt as preview */}
        <ChatInput
          onSend={onSendMessage}
          isLoading={false}
          placeholder={hoveredPrompt || "Ask Cody anything..."}
        />

        {/* Suggestion Categories OR expanded menu (same spot) */}
        <div>
          {!activeCategory ? (
            <div
              key="pills"
              style={{ animation: "fadeIn 0.25s ease-out" }}
              className="flex items-center justify-center gap-2 flex-wrap"
            >
              {SUGGESTIONS.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => handleCategoryClick(cat.label)}
                  className="
                    flex items-center gap-1.5 px-3.5 py-2 rounded-full
                    border border-[var(--border)] bg-[var(--bg-secondary)]
                    hover:bg-[var(--bg-hover)] hover:border-[var(--text-muted)]
                    text-sm text-[var(--text-secondary)]
                    transition-all duration-150
                  "
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div
              key="menu"
              style={{ animation: "fadeIn 0.25s ease-out" }}
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl overflow-hidden"
            >
              {/* Category header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                  {activeCategory.icon}
                  <span>{activeCategory.label}</span>
                </div>
                <button
                  onClick={() => { setOpenCategory(null); setHoveredPrompt(null); }}
                  className="p-1 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Prompts list */}
              <div className="divide-y divide-[var(--border)]">
                {activeCategory.prompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handlePromptClick(prompt)}
                    onMouseEnter={() => setHoveredPrompt(prompt)}
                    onMouseLeave={() => setHoveredPrompt(null)}
                    className="
                      w-full flex items-center justify-between px-4 py-3 text-left
                      text-sm text-[var(--text-primary)]
                      hover:bg-[var(--bg-hover)] transition-colors group
                    "
                  >
                    <span>{prompt}</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] transition-opacity shrink-0 ml-3"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

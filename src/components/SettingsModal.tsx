"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSettings } from "@/lib/SettingsContext";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/lib/api";
import { UserSettings, UserSettingsUpdate } from "@/lib/types";
import { AVATAR_DESIGNS, AvatarIcon, getInitials } from "@/lib/avatars";

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { settings, update } = useSettings();
  const { user } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [avatarIndex, setAvatarIndex] = useState<number | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [language, setLanguage] = useState<"en" | "fr" | "ar">("en");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");

  // Store the original values to detect changes
  const originalRef = useRef<{
    display_name: string;
    avatar_index: number | null;
    theme: "light" | "dark";
    language: "en" | "fr" | "ar";
  } | null>(null);

  useEffect(() => {
    if (settings) {
      setDisplayName(settings.display_name);
      setAvatarIndex(settings.avatar_index ?? null);
      setTheme(settings.theme);
      setLanguage(settings.language);
      originalRef.current = {
        display_name: settings.display_name,
        avatar_index: settings.avatar_index ?? null,
        theme: settings.theme,
        language: settings.language,
      };
      setLoading(false);
    } else {
      api.getSettings()
        .then((s: UserSettings) => {
          setDisplayName(s.display_name);
          setAvatarIndex(s.avatar_index ?? null);
          setTheme(s.theme);
          setLanguage(s.language);
          originalRef.current = {
            display_name: s.display_name,
            avatar_index: s.avatar_index ?? null,
            theme: s.theme,
            language: s.language,
          };
        })
        .catch(() => setError("Failed to load settings"))
        .finally(() => setLoading(false));
    }
  }, [settings]);

  function handleNameChange(value: string) {
    const filtered = value.replace(/[^a-zA-ZÀ-ÿ\s'-]/g, "");
    if (filtered.length <= 50) {
      setDisplayName(filtered);
      setNameError("");
    }
  }

  function randomizeAvatar() {
    let newIndex: number;
    do {
      newIndex = Math.floor(Math.random() * AVATAR_DESIGNS.length);
    } while (newIndex === avatarIndex && AVATAR_DESIGNS.length > 1);
    setAvatarIndex(newIndex);
  }

  function removeAvatar() {
    setAvatarIndex(null);
  }

  // Close instantly, persist valid changes in background
  const handleClose = useCallback(() => {
    const orig = originalRef.current;
    if (!orig) {
      onClose();
      return;
    }

    const changes: UserSettingsUpdate = {};
    let hasChanges = false;

    // Name: only save if valid (2+ chars, trimmed, not empty)
    const trimmedName = displayName.trim();
    if (trimmedName.length >= 2 && trimmedName !== orig.display_name) {
      changes.display_name = trimmedName;
      hasChanges = true;
    }

    // Avatar: save if changed
    if (avatarIndex !== orig.avatar_index) {
      changes.avatar_index = avatarIndex;
      hasChanges = true;
    }

    // Theme: save if changed
    if (theme !== orig.theme) {
      changes.theme = theme;
      hasChanges = true;
    }

    // Language: save if changed
    if (language !== orig.language) {
      changes.language = language;
      hasChanges = true;
    }

    // Optimistic update — closes immediately, syncs in background
    if (hasChanges) {
      update(changes);
    }

    onClose();
  }, [displayName, avatarIndex, theme, language, onClose, update]);

  const initials = getInitials(displayName || "User");
  const currentAvatar = avatarIndex !== null ? AVATAR_DESIGNS[avatarIndex] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors z-10"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[var(--text-muted)] border-t-[var(--text-primary)] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="p-6 space-y-8">
            {/* Profile Section */}
            <section>
              <h2 className="text-base font-semibold text-[var(--text-primary)] mb-5">Profile</h2>

              {/* Avatar */}
              <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
                <span className="text-sm text-[var(--text-secondary)]">Avatar</span>
                <div className="relative group">
                  {/* Avatar circle — click to randomize */}
                  <button
                    type="button"
                    onClick={randomizeAvatar}
                    className="relative w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
                    style={{ backgroundColor: currentAvatar?.bg || "var(--accent)" }}
                    title="Click to change avatar"
                  >
                    {currentAvatar ? (
                      <AvatarIcon icon={currentAvatar.icon} size={22} />
                    ) : (
                      <span className="text-sm font-semibold text-white">{initials}</span>
                    )}

                    {/* Shuffle overlay on hover */}
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="16 3 21 3 21 8" />
                        <line x1="4" y1="20" x2="21" y2="3" />
                        <polyline points="21 16 21 21 16 21" />
                        <line x1="15" y1="15" x2="21" y2="21" />
                        <line x1="4" y1="4" x2="9" y2="9" />
                      </svg>
                    </div>
                  </button>

                  {/* X button to remove avatar */}
                  {currentAvatar && (
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all opacity-0 group-hover:opacity-100"
                      title="Remove avatar"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Full name */}
              <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
                <div className="flex flex-col">
                  <span className="text-sm text-[var(--text-secondary)]">Full name</span>
                  {nameError && <span className="text-xs text-red-400 mt-0.5">{nameError}</span>}
                </div>
                <div className="flex flex-col items-end">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    maxLength={50}
                    placeholder="Your name"
                    className={`w-[220px] text-right text-sm px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-colors ${
                      nameError ? "border-red-400 focus:border-red-400" : "border-[var(--border)] focus:border-[var(--accent)]"
                    }`}
                  />
                  <span className="text-[10px] text-[var(--text-muted)] mt-1">{displayName.length}/50</span>
                </div>
              </div>

              {/* Email (read-only) */}
              <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
                <span className="text-sm text-[var(--text-secondary)]">Email</span>
                <span className="text-sm text-[var(--text-muted)]">{user?.email || "—"}</span>
              </div>
            </section>

            {/* Preferences Section */}
            <section>
              <h2 className="text-base font-semibold text-[var(--text-primary)] mb-5">Preferences</h2>

              {/* Appearance */}
              <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
                <span className="text-sm text-[var(--text-secondary)]">Appearance</span>
                <div className="flex items-center bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border)] p-0.5">
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      theme === "light"
                        ? "bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm"
                        : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                    }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block">
                      <circle cx="12" cy="12" r="5" />
                      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      theme === "dark"
                        ? "bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm"
                        : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                    }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block">
                      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Language */}
              <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
                <span className="text-sm text-[var(--text-secondary)]">Language</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as "en" | "fr" | "ar")}
                  className="text-sm px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors appearance-none cursor-pointer pr-8"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" }}
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="ar">العربية</option>
                </select>
              </div>
            </section>

            {/* Error feedback (only for load failures) */}
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

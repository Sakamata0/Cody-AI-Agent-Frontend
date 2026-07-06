"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/lib/api";
import { UserSettings, UserSettingsUpdate } from "@/lib/types";
import ProtectedRoute from "@/components/ProtectedRoute";

function SettingsForm() {
  const { isAuthenticated } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [language, setLanguage] = useState<"en" | "fr" | "ar">("en");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ display_name?: string }>({});

  // Fetch settings on mount
  useEffect(() => {
    if (!isAuthenticated) return;

    async function fetchSettings() {
      try {
        const settings: UserSettings = await api.getSettings();
        setDisplayName(settings.display_name);
        setTheme(settings.theme);
        setLanguage(settings.language);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load settings");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, [isAuthenticated]);

  function validate(): boolean {
    const errors: { display_name?: string } = {};

    if (!displayName.trim()) {
      errors.display_name = "Display name is required";
    } else if (displayName.trim().length > 50) {
      errors.display_name = "Display name must be 50 characters or less";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validate()) return;

    setSaving(true);

    try {
      const update: UserSettingsUpdate = {
        display_name: displayName.trim(),
        theme,
        language,
      };

      const updated = await api.updateSettings(update);
      setDisplayName(updated.display_name);
      setTheme(updated.theme);
      setLanguage(updated.language);
      setSuccess("Settings saved successfully");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to save settings");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 border-2 border-[var(--text-muted)] border-t-[var(--text-primary)] rounded-full animate-spin"
            role="status"
            aria-label="Loading settings"
          />
          <span className="text-sm text-[var(--text-secondary)]">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)] px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Settings
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Manage your account preferences
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Display Name */}
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
            >
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setFieldErrors({});
                setSuccess("");
              }}
              maxLength={50}
              placeholder="Your display name"
              className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors"
            />
            {fieldErrors.display_name && (
              <p className="mt-1 text-sm text-red-400" role="alert">
                {fieldErrors.display_name}
              </p>
            )}
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {displayName.length}/50 characters
            </p>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              Theme
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={theme === "dark"}
                  onChange={() => {
                    setTheme("dark");
                    setSuccess("");
                  }}
                  className="w-4 h-4 accent-[var(--accent)]"
                />
                <span className="text-sm text-[var(--text-primary)]">Dark</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={theme === "light"}
                  onChange={() => {
                    setTheme("light");
                    setSuccess("");
                  }}
                  className="w-4 h-4 accent-[var(--accent)]"
                />
                <span className="text-sm text-[var(--text-primary)]">Light</span>
              </label>
            </div>
          </div>

          {/* Language */}
          <div>
            <label
              htmlFor="language"
              className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
            >
              Language
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value as "en" | "fr" | "ar");
                setSuccess("");
              }}
              className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors"
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
            </select>
          </div>

          {/* Success Message */}
          {success && (
            <p className="text-sm text-green-400" role="status">
              {success}
            </p>
          )}

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </form>

        {/* Back Link */}
        <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
          <Link
            href="/"
            className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
          >
            ← Back to Chat
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsForm />
    </ProtectedRoute>
  );
}

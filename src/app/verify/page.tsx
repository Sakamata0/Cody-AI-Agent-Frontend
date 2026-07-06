"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verify, isAuthenticated, isLoading } = useAuth();

  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect authenticated users to home
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  function handleCodeChange(value: string) {
    // Only allow digits, max 6 characters
    const sanitized = value.replace(/\D/g, "").slice(0, 6);
    setCode(sanitized);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email address is missing. Please go back to registration.");
      return;
    }

    if (code.length !== 6) {
      setError("Please enter a valid 6-digit verification code");
      return;
    }

    setIsSubmitting(true);

    try {
      await verify(email, code);
      router.push("/login");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Verification code is invalid or expired");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)]">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)] px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Verify your email
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Enter the 6-digit code sent to{" "}
            {email ? (
              <span className="text-[var(--text-primary)] font-medium">
                {email}
              </span>
            ) : (
              "your email"
            )}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Code Field */}
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
            >
              Verification Code
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="000000"
              maxLength={6}
              autoComplete="one-time-code"
              className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors text-center text-lg tracking-widest"
            />
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || code.length !== 6}
            className="w-full py-2.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        {/* Back to Login Link */}
        <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
          Already verified?{" "}
          <Link
            href="/login"
            className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

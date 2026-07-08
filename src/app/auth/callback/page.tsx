"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError(`Authentication failed: ${errorParam}`);
      return;
    }

    if (!code) {
      setError("No authorization code received");
      return;
    }

    // Exchange code via backend proxy (handles client secret server-side)
    async function exchangeCode() {
      try {
        const redirectUri = window.location.origin + "/auth/callback";
        const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

        const res = await fetch(`${BASE_URL}/auth/oauth/token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, redirect_uri: redirectUri }),
        });

        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.detail || "Token exchange failed");
        }

        const tokens = await res.json();

        // Store tokens
        localStorage.setItem("access_token", tokens.access_token);
        localStorage.setItem("id_token", tokens.id_token);
        if (tokens.refresh_token) {
          localStorage.setItem("refresh_token", tokens.refresh_token);
        }

        // Redirect to home
        window.location.href = "/";
      } catch (err) {
        setError(err instanceof Error ? err.message : "Authentication failed");
      }
    }

    exchangeCode();
  }, [searchParams, router]);

  if (isAuthenticated) {
    router.push("/");
    return null;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)] px-4">
        <div className="text-center space-y-4">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="text-[var(--accent)] hover:underline text-sm"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)]">
      <div className="text-center space-y-3">
        <div className="animate-spin w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full mx-auto" />
        <p className="text-[var(--text-secondary)] text-sm">Signing you in...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)]">
          <div className="text-[var(--text-secondary)]">Loading...</div>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}

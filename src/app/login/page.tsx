"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

const COGNITO_DOMAIN = "https://eu-north-1ipa8bcttq.auth.eu-north-1.amazoncognito.com";
const CLIENT_ID = "7h2bhhvhdmls8c6jm515454kuj";

type Step = "email" | "code";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [session, setSession] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  async function handleEmailSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/auth/otp/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.detail || "Failed to send code");
      }

      const data = await res.json();
      setSession(data.session);
      setStep("code");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCodeSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (code.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, session }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.detail || "Invalid code");
      }

      const tokens = await res.json();
      localStorage.setItem("access_token", tokens.access_token);
      localStorage.setItem("id_token", tokens.id_token);
      if (tokens.refresh_token) {
        localStorage.setItem("refresh_token", tokens.refresh_token);
      }
      window.location.href = "/";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleGoogleLogin() {
    const redirectUri = encodeURIComponent(window.location.origin + "/auth/callback");
    const url = `${COGNITO_DOMAIN}/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&identity_provider=Google&scope=openid+email+profile&prompt=select_account`;
    window.location.href = url;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)]">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      {/* Top nav — logo */}
      <nav className="px-8 py-5">
        <div className="flex items-center gap-2">
          <img src="/cody.png" alt="Cody" className="w-7 h-7 rounded-md" />
          <span className="text-[var(--text-primary)] font-semibold text-xl" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Cody</span>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Left side */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          {step === "email" ? (
            <>
              {/* Hero tagline */}
              <div className="text-center mb-5 max-w-md">
                <h1 className="text-6xl font-light text-[var(--text-primary)] leading-tight tracking-tight" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  Think fast,<br />build faster
                </h1>
                <p className="mt-2 text-lg text-[var(--text-secondary)] leading-relaxed">
                  Your autonomous AI agent for search, analysis,<br />prediction, and code execution.
                </p>
              </div>

              {/* Auth card */}
              <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 space-y-0">
                {/* Google */}
                <button
                  onClick={handleGoogleLogin}
                  className="w-full py-2.5 mb-[10px] rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] font-medium transition-colors flex items-center justify-center gap-2.5 text-sm"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>

                {/* Divider */}
                <div className="text-center mb-[10px]">
                  <span className="text-[12px] text-[var(--text-muted)] uppercase tracking-wider">or</span>
                </div>

                {/* Email form */}
                <form onSubmit={handleEmailSubmit} className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    autoComplete="email"
                    className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors text-sm"
                  />
                  {error && <p className="text-xs text-red-400">{error}</p>}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-lg bg-[var(--text-primary)] text-[var(--bg-primary)] font-medium text-base transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Sending code..." : "Continue with email"}
                  </button>
                </form>

                <p className="text-[12px] text-[var(--text-muted)] text-center pt-4">
                  By continuing, you acknowledge SMARTOVATE&apos;s Terms of Service.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Code verification step */}
              <div className="text-center mb-8 max-w-md">
                <h1 className="text-4xl font-light text-[var(--text-primary)] leading-tight tracking-tight" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  Check your email
                </h1>
                <p className="mt-4 text-sm text-[var(--text-secondary)]">
                  We sent a 6-digit code to <span className="text-[var(--text-primary)] font-medium">{email}</span>
                </p>
              </div>

              <div className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 space-y-4">
                <form onSubmit={handleCodeSubmit} className="space-y-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                    autoComplete="one-time-code"
                    className="w-full px-3 py-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors text-center text-xl tracking-[0.3em] font-mono"
                  />
                  {error && <p className="text-xs text-red-400">{error}</p>}
                  <button
                    type="submit"
                    disabled={isSubmitting || code.length !== 6}
                    className="w-full py-2.5 rounded-lg bg-[var(--text-primary)] text-[var(--bg-primary)] font-medium text-sm transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Verifying..." : "Verify"}
                  </button>
                </form>

                <button
                  onClick={() => { setStep("email"); setCode(""); setError(""); }}
                  className="w-full text-center text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  ← Use a different email
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right side — Image/Video placeholder */}
        <div className="hidden lg:flex flex-1 items-center justify-center p-8">
          <div className="w-full max-w-lg aspect-[4/3] rounded-2xl overflow-hidden bg-[var(--bg-secondary)] flex items-center justify-center">
            {/* Replace this with your Runway video once ready */}
            <video
              src="/promo.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to image if video doesn't exist
                const target = e.target as HTMLVideoElement;
                target.style.display = "none";
                target.parentElement!.innerHTML = `
                  <img src="/cody.png" alt="Cody" class="w-32 h-32 rounded-2xl opacity-20" />
                `;
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

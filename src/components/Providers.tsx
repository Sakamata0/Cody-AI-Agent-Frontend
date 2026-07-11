"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/lib/AuthContext";
import { ChatProvider } from "@/lib/ChatContext";
import { SettingsProvider } from "@/lib/SettingsContext";
import { ToastProvider } from "@/lib/ToastContext";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <ToastProvider>
        <SettingsProvider>
          <ChatProvider>{children}</ChatProvider>
        </SettingsProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

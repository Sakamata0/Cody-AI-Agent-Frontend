"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/lib/AuthContext";
import { ChatProvider } from "@/lib/ChatContext";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <ChatProvider>{children}</ChatProvider>
    </AuthProvider>
  );
}

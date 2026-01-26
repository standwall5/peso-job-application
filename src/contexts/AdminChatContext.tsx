"use client";

import React, { createContext, useContext, useRef, ReactNode } from "react";

export interface AdminChatWidgetRef {
  initiateChat: (applicantId: number, applicantName: string) => Promise<void>;
}

interface AdminChatContextType {
  chatWidgetRef: React.RefObject<AdminChatWidgetRef | null> | null;
}

const AdminChatContext = createContext<AdminChatContextType>({
  chatWidgetRef: null,
});

export function AdminChatProvider({ children }: { children: ReactNode }) {
  const chatWidgetRef = useRef<AdminChatWidgetRef>(null);

  return (
    <AdminChatContext.Provider value={{ chatWidgetRef }}>
      {children}
    </AdminChatContext.Provider>
  );
}

export function useAdminChat() {
  const context = useContext(AdminChatContext);

  if (!context) {
    throw new Error("useAdminChat must be used within AdminChatProvider");
  }

  return context;
}

export async function initiateChat(
  chatWidgetRef: React.RefObject<AdminChatWidgetRef> | null,
  applicantId: number,
  applicantName: string,
): Promise<boolean> {
  if (!chatWidgetRef?.current) {
    console.error("Chat widget ref not available");
    return false;
  }

  try {
    await chatWidgetRef.current.initiateChat(applicantId, applicantName);
    return true;
  } catch (error) {
    console.error("Failed to initiate chat:", error);
    return false;
  }
}

"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { createClient } from "@/utils/supabase/client";
import AdminChatButton from "./AdminChatButton";
import AdminChatPanel from "./AdminChatPanel";
import { getAdminChatSessionsAction } from "@/app/admin/actions/chat.actions";

interface ChatRequest {
  id: string;
  userId: number;
  userName: string;
  userEmail: string;
  concern: string;
  status: "pending" | "active" | "closed";
  timestamp: Date;
  closedAt: Date | null;
}

export interface AdminChatWidgetRef {
  initiateChat: (applicantId: number, applicantName: string) => Promise<void>;
}

const AdminChatWidget = forwardRef<AdminChatWidgetRef>((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingChats, setPendingChats] = useState<ChatRequest[]>([]);
  const [activeChats, setActiveChats] = useState<ChatRequest[]>([]);
  const [closedChats, setClosedChats] = useState<ChatRequest[]>([]);
  const [initiatedApplicantId, setInitiatedApplicantId] = useState<
    number | null
  >(null);
  const isFetchingRef = useRef(false);
  const fetchDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch all chat requests
  const fetchAllChats = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    try {
      console.log("[AdminChatWidget] Fetching all chats...");

      // Fetch all statuses in parallel using server actions
      const [pendingData, activeData, closedData] = await Promise.all([
        getAdminChatSessionsAction("pending"),
        getAdminChatSessionsAction("active"),
        getAdminChatSessionsAction("closed"),
      ]);

      setPendingChats(pendingData);
      setActiveChats(activeData);
      setClosedChats(closedData);

      console.log("[AdminChatWidget] Chats fetched:", {
        pending: pendingData.length,
        active: activeData.length,
        closed: closedData.length,
      });
    } catch (error) {
      console.error("Error fetching chat requests:", error);
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  // Poll for new requests every 30 seconds and setup real-time subscription
  useEffect(() => {
    const supabase = createClient();

    // Debounced fetch to prevent rapid successive calls
    const debouncedFetchCounts = () => {
      if (fetchDebounceTimerRef.current) {
        clearTimeout(fetchDebounceTimerRef.current);
      }
      fetchDebounceTimerRef.current = setTimeout(() => {
        fetchAllChats();
      }, 500); // Wait 500ms after last event before fetching
    };

    // Initial fetch
    fetchAllChats();

    // Subscribe to new chat sessions for real-time updates
    const channel = supabase
      .channel("admin-chat-sessions")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_sessions",
        },
        (payload) => {
          const newSession = payload.new as { id: string; status: string };
          console.log("[AdminChatWidget] INSERT event:", {
            sessionId: newSession.id,
            status: newSession.status,
            timestamp: new Date().toISOString(),
          });
          // New chat session created, debounced refresh all chats
          debouncedFetchCounts();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_sessions",
        },
        (payload) => {
          const newSession = payload.new as { id: string; status: string };
          const oldSession = payload.old as { id: string; status: string };
          console.log("[AdminChatWidget] UPDATE event:", {
            sessionId: newSession.id,
            oldStatus: oldSession.status,
            newStatus: newSession.status,
            timestamp: new Date().toISOString(),
          });
          // Chat session status changed, debounced refresh all chats
          debouncedFetchCounts();
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
      if (fetchDebounceTimerRef.current) {
        clearTimeout(fetchDebounceTimerRef.current);
      }
    };
  }, [fetchAllChats]);

  // Refresh all chats when panel is closed (only once, not continuously)
  const prevIsOpenRef = useRef(isOpen);
  useEffect(() => {
    if (prevIsOpenRef.current && !isOpen) {
      // Panel just closed, refresh all chats
      fetchAllChats();
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, fetchAllChats]);

  // Expose initiateChat method to parent components
  useImperativeHandle(ref, () => ({
    initiateChat: async (applicantId: number, applicantName: string) => {
      try {
        const response = await fetch("/api/admin/chat/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            applicantId,
            initialMessage: `Hello ${applicantName}, how can I help you?`,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to initiate chat");
        }

        const data = await response.json();

        // Refresh chats to show the new session
        await fetchAllChats();

        // Open the panel and set it to active chats
        setIsOpen(true);
        setInitiatedApplicantId(applicantId);

        return data;
      } catch (error) {
        console.error("Error initiating chat:", error);
        throw error;
      }
    },
  }));

  return (
    <>
      <AdminChatButton
        onClick={() => setIsOpen(!isOpen)}
        newCount={pendingChats.length}
        activeCount={activeChats.length}
      />
      <AdminChatPanel
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setInitiatedApplicantId(null);
        }}
        pendingChats={pendingChats}
        activeChats={activeChats}
        closedChats={closedChats}
        onRefresh={fetchAllChats}
        initiatedApplicantId={initiatedApplicantId}
      />
    </>
  );
});

AdminChatWidget.displayName = "AdminChatWidget";

export default AdminChatWidget;

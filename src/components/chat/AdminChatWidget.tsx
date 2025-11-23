"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import AdminChatButton from "./AdminChatButton";
import AdminChatPanel from "./AdminChatPanel";

interface ChatRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  concern: string;
  status: "pending" | "active" | "closed";
  timestamp: Date;
  closedAt: Date | null;
}

export default function AdminChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingChats, setPendingChats] = useState<ChatRequest[]>([]);
  const [activeChats, setActiveChats] = useState<ChatRequest[]>([]);
  const [closedChats, setClosedChats] = useState<ChatRequest[]>([]);
  const isFetchingRef = useRef(false);
  const fetchDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch all chat requests
  const fetchAllChats = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    try {
      console.log("[AdminChatWidget] Fetching all chats...");

      // Fetch pending requests
      const pendingResponse = await fetch(
        "/api/admin/chat/requests?status=pending",
      );
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        const formattedPending = (pendingData || []).map(
          (request: {
            timestamp: string | Date;
            closedAt?: string | Date | null;
            [key: string]: unknown;
          }) => ({
            ...request,
            timestamp: new Date(request.timestamp),
            closedAt: request.closedAt ? new Date(request.closedAt) : null,
          }),
        );
        setPendingChats(formattedPending);
        console.log(
          "[AdminChatWidget] Pending chats:",
          formattedPending.length,
        );
      }

      // Fetch active requests
      const activeResponse = await fetch(
        "/api/admin/chat/requests?status=active",
      );
      if (activeResponse.ok) {
        const activeData = await activeResponse.json();
        const formattedActive = (activeData || []).map(
          (request: {
            timestamp: string | Date;
            closedAt?: string | Date | null;
            [key: string]: unknown;
          }) => ({
            ...request,
            timestamp: new Date(request.timestamp),
            closedAt: request.closedAt ? new Date(request.closedAt) : null,
          }),
        );
        setActiveChats(formattedActive);
        console.log("[AdminChatWidget] Active chats:", formattedActive.length);
      }

      // Fetch closed requests
      const closedResponse = await fetch(
        "/api/admin/chat/requests?status=closed",
      );
      if (closedResponse.ok) {
        const closedData = await closedResponse.json();
        const formattedClosed = (closedData || []).map(
          (request: {
            timestamp: string | Date;
            closedAt?: string | Date | null;
            [key: string]: unknown;
          }) => ({
            ...request,
            timestamp: new Date(request.timestamp),
            closedAt: request.closedAt ? new Date(request.closedAt) : null,
          }),
        );
        setClosedChats(formattedClosed);
        console.log("[AdminChatWidget] Closed chats:", formattedClosed.length);
      }
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

    // Poll every 30 seconds (reduced from 10)
    const interval = setInterval(fetchAllChats, 30000);

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
      clearInterval(interval);
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

  return (
    <>
      <AdminChatButton
        onClick={() => setIsOpen(!isOpen)}
        newCount={pendingChats.length}
        activeCount={activeChats.length}
      />
      <AdminChatPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        pendingChats={pendingChats}
        activeChats={activeChats}
        closedChats={closedChats}
        onRefresh={fetchAllChats}
      />
    </>
  );
}

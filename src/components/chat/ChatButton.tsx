"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import styles from "./ChatButton.module.css";
import { getUnreadMessageCountAction } from "@/app/(user)/actions/chat.actions";

interface ChatButtonProps {
  onClick: () => void;
  hasActiveSession?: boolean;
}

export default function ChatButton({
  onClick,
  hasActiveSession = false,
}: ChatButtonProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadMessageCountAction();
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchUnreadCount();

    // Poll every 10 seconds
    const pollInterval = setInterval(fetchUnreadCount, 10000);

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel("user-chat-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          const newMsg = payload.new as {
            sender: string;
            read_by_user: boolean | null;
          };
          // If message is from admin and unread (null or false), increment count
          if (
            newMsg.sender === "admin" &&
            (newMsg.read_by_user === false || newMsg.read_by_user === null)
          ) {
            console.log("[ChatButton] New unread message from admin");
            fetchUnreadCount();
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_messages",
        },
        () => {
          // Messages marked as read, update count
          fetchUnreadCount();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_sessions",
        },
        (payload) => {
          const newSession = payload.new as {
            status: string;
            admin_id: number | null;
          };
          // If admin initiated a new chat session, show notification
          if (newSession.admin_id) {
            console.log("[ChatButton] New chat session initiated by admin");
            fetchUnreadCount();
          }
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
          const updatedSession = payload.new as {
            status: string;
          };
          // Session status changed, update count
          if (
            updatedSession.status === "active" ||
            updatedSession.status === "closed"
          ) {
            fetchUnreadCount();
          }
        },
      )
      .subscribe();

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <button
      className={styles.chatButton}
      onClick={onClick}
      aria-label="Open chat"
    >
      {(unreadCount > 0 || hasActiveSession) && (
        <span className={styles.badge}>
          {unreadCount > 0 ? (unreadCount > 99 ? "99+" : unreadCount) : "•"}
        </span>
      )}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={styles.icon}
      >
        <path
          fillRule="evenodd"
          d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223ZM8.25 10.875a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.875 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );
}

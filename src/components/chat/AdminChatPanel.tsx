"use client";

import React, { useState, useEffect, useRef } from "react";
import Button from "@/components/Button";
import BlocksWave from "@/components/BlocksWave";
import Toast from "@/components/toast/Toast";
import { createClient } from "@/utils/supabase/client";
import styles from "./AdminChatPanel.module.css";
import {
  acceptChatSessionAction,
  getChatSessionMessagesAction,
  sendAdminMessageAction,
  closeChatSessionAction,
} from "@/app/admin/actions/chat.actions";

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

interface Message {
  id: number | string;
  chatId: string;
  text: string;
  sender: "user" | "admin" | "bot";
  timestamp: Date;
}

interface AdminChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  pendingChats: ChatRequest[];
  activeChats: ChatRequest[];
  closedChats: ChatRequest[];
  onRefresh: () => void;
  initiatedApplicantId?: number | null;
}

function AdminChatPanel({
  isOpen,
  onClose,
  pendingChats,
  activeChats,
  closedChats,
  onRefresh,
  initiatedApplicantId,
}: AdminChatPanelProps) {
  const [activeTab, setActiveTab] = useState<
    "pending" | "active" | "closed" | "new"
  >("pending");
  const [activeChat, setActiveChat] = useState<ChatRequest | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [userTyping, setUserTyping] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [applicantSearchQuery, setApplicantSearchQuery] = useState("");
  const [searchedApplicants, setSearchedApplicants] = useState<
    Array<{
      id: number;
      name: string;
      email: string;
      phone: string | null;
    }>
  >([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [initiatingChat, setInitiatingChat] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    title: "",
    message: "",
    type: "success" as "success" | "error" | "warning" | "info",
  });
  const supabase = createClient();
  const messageSubscriptionRef = useRef<ReturnType<
    typeof supabase.channel
  > | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(
    null,
  );

  // Get chat requests for current tab from props
  const chatRequests =
    activeTab === "pending"
      ? pendingChats
      : activeTab === "active"
        ? activeChats
        : activeTab === "closed"
          ? closedChats
          : [];

  // Filter chats based on search query
  const filteredChats = chatRequests.filter((chat) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      chat.userName.toLowerCase().includes(query) ||
      chat.userEmail.toLowerCase().includes(query) ||
      chat.concern.toLowerCase().includes(query)
    );
  });

  // Search all applicants (for "Start New Chat" tab)
  const searchAllApplicants = async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSearchedApplicants([]);
      return;
    }

    setLoadingSearch(true);
    try {
      const response = await fetch(
        `/api/admin/applicants/search?q=${encodeURIComponent(query)}`,
      );
      if (response.ok) {
        const data = await response.json();
        setSearchedApplicants(data);
      } else {
        console.error("Failed to search applicants");
        setSearchedApplicants([]);
      }
    } catch (error) {
      console.error("Error searching applicants:", error);
      setSearchedApplicants([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  // Debounce applicant search
  useEffect(() => {
    if (activeTab !== "new") return;

    const timer = setTimeout(() => {
      searchAllApplicants(applicantSearchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [applicantSearchQuery, activeTab]);

  // Initiate chat with an applicant
  const handleInitiateChat = async (
    applicantId: number,
    applicantName: string,
  ) => {
    setInitiatingChat(true);
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

      // Refresh chats to show the new/existing session
      onRefresh();

      // Switch to active tab and wait for refresh
      setActiveTab("active");
      setApplicantSearchQuery("");
      setSearchedApplicants([]);

      // Show success message
      setToast({
        show: true,
        title: data.existing ? "Chat Already Exists" : "Chat Initiated",
        message: data.existing
          ? `You already have an active chat with ${applicantName}`
          : `Chat with ${applicantName} has been started`,
        type: data.existing ? "info" : "success",
      });
    } catch (error) {
      console.error("Error initiating chat:", error);
      setToast({
        show: true,
        title: "Failed to Initiate Chat",
        message: error instanceof Error ? error.message : "Unknown error",
        type: "error",
      });
    } finally {
      setInitiatingChat(false);
    }
  };

  // Auto-select chat when initiated from external component
  useEffect(() => {
    if (initiatedApplicantId && isOpen) {
      // Switch to active tab
      setActiveTab("active");

      // Find and select the chat with the initiated applicant
      const initiatedChat = activeChats.find(
        (chat) => chat.userId === initiatedApplicantId,
      );

      if (initiatedChat) {
        setActiveChat(initiatedChat);
      }
    }
  }, [initiatedApplicantId, isOpen, activeChats]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Set up real-time subscription for messages and typing
  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id);
      subscribeToMessages(activeChat.id);
      subscribeToTyping(activeChat.id);
    }

    return () => {
      if (messageSubscriptionRef.current) {
        supabase.removeChannel(messageSubscriptionRef.current);
      }
      if (typingChannelRef.current) {
        supabase.removeChannel(typingChannelRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChat]);

  const subscribeToMessages = async (chatId: string) => {
    // Remove existing subscription if any
    if (messageSubscriptionRef.current) {
      await supabase.removeChannel(messageSubscriptionRef.current);
    }

    // Create new subscription
    const channel = supabase
      .channel(`chat_messages_admin:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `chat_session_id=eq.${chatId}`,
        },
        (payload) => {
          const newMsg = payload.new as {
            id: string;
            chat_session_id: string;
            message: string;
            sender: string;
            created_at: string;
          };
          console.log("[AdminChatPanel] Realtime message received:", {
            messageId: newMsg.id,
            chatId: newMsg.chat_session_id,
            sender: newMsg.sender,
            textPreview: newMsg.message.substring(0, 50),
          });
          const message: Message = {
            id: newMsg.id,
            chatId: newMsg.chat_session_id,
            text: newMsg.message,
            sender: newMsg.sender as "user" | "admin",
            timestamp: new Date(newMsg.created_at),
          };
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === message.id)) {
              console.log("[AdminChatPanel] Duplicate message, skipping:", {
                messageId: message.id,
              });
              return prev;
            }
            console.log("[AdminChatPanel] Adding message to state:", {
              messageId: message.id,
              previousCount: prev.length,
              newCount: prev.length + 1,
            });
            return [...prev, message];
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_sessions",
          filter: `id=eq.${chatId}`,
        },
        (payload) => {
          const updatedSession = payload.new as {
            id: string;
            status: string;
            closed_at: string | null;
          };
          const oldSession = payload.old as {
            id: string;
            status: string;
          };
          console.log("[AdminChatPanel] Chat session updated:", {
            sessionId: updatedSession.id,
            oldStatus: oldSession.status,
            newStatus: updatedSession.status,
            closedAt: updatedSession.closed_at,
            hasActiveChat: !!activeChat,
            activeChatId: activeChat?.id,
          });

          // If user closed the chat, show notification message
          if (updatedSession.status === "closed" && activeChat) {
            console.log(
              "[AdminChatPanel] User closed chat - showing notification",
            );
            setMessages((prev) => [
              ...prev,
              {
                id: "system-closed-" + Date.now(),
                chatId: chatId,
                text: "🔴 User has closed the chat",
                sender: "user",
                timestamp: new Date(),
              },
            ]);

            // Update active chat status
            setActiveChat((prev) =>
              prev ? { ...prev, status: "closed" } : null,
            );

            // Refresh data
            console.log("[AdminChatPanel] Calling onRefresh after user close");
            onRefresh();
          } else {
            console.log(
              "[AdminChatPanel] Session update but not showing notification:",
              {
                isClosed: updatedSession.status === "closed",
                hasActiveChat: !!activeChat,
              },
            );
          }
        },
      )
      .subscribe();

    messageSubscriptionRef.current = channel;
  };

  // Subscribe to typing indicators
  const subscribeToTyping = async (chatId: string) => {
    console.log("[AdminChatPanel] Setting up typing subscription for:", chatId);
    if (!chatId) return;

    if (typingChannelRef.current) {
      console.log("[AdminChatPanel] Removing old typing channel");
      await supabase.removeChannel(typingChannelRef.current);
    }

    const channel = supabase
      .channel(`typing:${chatId}`)
      .on("broadcast", { event: "typing" }, (payload) => {
        console.log("[AdminChatPanel] Typing broadcast received:", payload);
        if (payload.payload.sender === "user") {
          console.log("[AdminChatPanel] User is typing!");
          setUserTyping(true);
          // Clear typing indicator after 3 seconds
          setTimeout(() => {
            console.log("[AdminChatPanel] Clearing user typing indicator");
            setUserTyping(false);
          }, 3000);
        }
      })
      .subscribe((status) => {
        console.log(
          "[AdminChatPanel] Typing channel subscription status:",
          status,
        );
      });

    typingChannelRef.current = channel;
    console.log("[AdminChatPanel] Typing subscription created");
  };

  // Send typing indicator
  const sendTypingIndicator = () => {
    console.log("[AdminChatPanel] sendTypingIndicator called", {
      hasActiveChat: !!activeChat,
      hasChannel: !!typingChannelRef.current,
    });

    if (!activeChat || !typingChannelRef.current) {
      console.log(
        "[AdminChatPanel] Cannot send typing - missing activeChat or channel",
      );
      return;
    }

    console.log("[AdminChatPanel] Broadcasting typing event");
    typingChannelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: { sender: "admin", sessionId: activeChat.id },
    });
  };

  // Handle input change with typing indicator
  const handleInputChange = (value: string) => {
    console.log("[AdminChatPanel] Input changed, length:", value.length);
    setInputValue(value);

    // Send typing indicator
    sendTypingIndicator();

    // Debounce typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const fetchMessages = async (chatId: string) => {
    setLoadingMessages(true);
    try {
      const data = await getChatSessionMessagesAction(chatId);

      // Map database messages to component format
      // The service already returns ChatMessage with correct structure
      const mappedMessages = (data || []).map((msg) => ({
        id: msg.id,
        chatId: msg.chat_session_id,
        text: msg.message,
        sender: msg.sender as "user" | "admin" | "bot",
        timestamp: new Date(msg.created_at),
      }));

      setMessages(mappedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleAcceptChat = async (request: ChatRequest) => {
    setLoadingMessages(true);
    try {
      await acceptChatSessionAction(request.id);

      // Update request status locally
      const updatedRequest = { ...request, status: "active" as const };
      setActiveChat(updatedRequest);
      setActiveTab("active");
      // Refresh data to ensure UI is in sync
      onRefresh();
    } catch (error) {
      console.error("Error accepting chat:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setToast({
        show: true,
        title: "Failed to Accept Chat",
        message: errorMessage,
        type: "error",
      });
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !activeChat) return;

    const messageText = inputValue;
    setInputValue("");

    console.log("[AdminChatPanel] Sending message:", {
      chatId: activeChat.id,
      messageLength: messageText.length,
      userName: activeChat.userName,
    });

    // Optimistic UI update - show message immediately
    const optimisticMessageId = "temp-" + Date.now();
    const optimisticMessage: Message = {
      id: optimisticMessageId,
      chatId: activeChat.id,
      text: messageText,
      sender: "admin",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    console.log("[AdminChatPanel] Added optimistic message:", {
      id: optimisticMessageId,
      text: messageText.substring(0, 50),
    });

    try {
      await sendAdminMessageAction(activeChat.id, messageText);

      console.log("[AdminChatPanel] Message sent successfully");

      // Replace optimistic message with real one when realtime event arrives
      // The realtime subscription will handle adding the confirmed message
      // and we'll remove the optimistic one if it still exists
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessageId));
    } catch (error) {
      console.error("[AdminChatPanel] Error sending message:", error);
      // Replace optimistic message with error message
      setMessages((prev) =>
        prev.map((m) =>
          m.id === optimisticMessageId
            ? {
                ...m,
                text: "❌ Failed to send: " + messageText,
                id: "error-" + Date.now(),
              }
            : m,
        ),
      );
    }
  };

  const handleEndChat = async () => {
    if (!activeChat) return;

    try {
      await closeChatSessionAction(activeChat.id);

      setActiveChat(null);
      setMessages([]);
      setActiveTab("closed");
      // Refresh data to ensure UI is in sync
      onRefresh();
    } catch (error) {
      console.error("Error ending chat:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setToast({
        show: true,
        title: "Failed to Close Chat",
        message: errorMessage,
        type: "error",
      });
    }
  };

  // Badge counts are now passed from parent via props
  const newChatsCount = pendingChats.length;
  const activeChatsCount = activeChats.length;

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.adminPanel}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Chat Management</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={styles.closeIcon}
            >
              <path
                fillRule="evenodd"
                d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className={styles.content}>
          {/* Sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === "pending" ? styles.active : ""}`}
                onClick={() => {
                  setActiveTab("pending");
                  setActiveChat(null);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={styles.tabIcon}
                >
                  <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
                  <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
                </svg>
                New Requests
                {newChatsCount > 0 && (
                  <span className={styles.badge}>{newChatsCount}</span>
                )}
              </button>

              <button
                className={`${styles.tab} ${activeTab === "active" ? styles.active : ""}`}
                onClick={() => {
                  setActiveTab("active");
                  setActiveChat(null);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={styles.tabIcon}
                >
                  <path
                    fillRule="evenodd"
                    d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223ZM8.25 10.875a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.875 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z"
                    clipRule="evenodd"
                  />
                </svg>
                Active Chats
                {activeChatsCount > 0 && (
                  <span className={styles.badge}>{activeChatsCount}</span>
                )}
              </button>

              <button
                className={`${styles.tab} ${activeTab === "closed" ? styles.active : ""}`}
                onClick={() => {
                  setActiveTab("closed");
                  setActiveChat(null);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={styles.tabIcon}
                >
                  <path
                    fillRule="evenodd"
                    d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                    clipRule="evenodd"
                  />
                </svg>
                Closed Chats
              </button>

              <button
                className={`${styles.tab} ${activeTab === "new" ? styles.active : ""}`}
                onClick={() => {
                  setActiveTab("new");
                  setActiveChat(null);
                  setApplicantSearchQuery("");
                  setSearchedApplicants([]);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={styles.tabIcon}
                >
                  <path d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25H15a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H21a.75.75 0 0 0 0-1.5h-2.25V7.5Z" />
                </svg>
                Start New Chat
              </button>
            </div>

            {/* Search Input - different behavior for "new" tab */}
            <div className={styles.searchContainer}>
              {activeTab === "new" ? (
                <>
                  <input
                    type="text"
                    placeholder="Search all applicants by name or phone..."
                    value={applicantSearchQuery}
                    onChange={(e) => setApplicantSearchQuery(e.target.value)}
                    className={styles.searchInput}
                  />
                  {applicantSearchQuery && (
                    <button
                      className={styles.clearSearch}
                      onClick={() => {
                        setApplicantSearchQuery("");
                        setSearchedApplicants([]);
                      }}
                      aria-label="Clear search"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        style={{ width: "1rem", height: "1rem" }}
                      >
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                      </svg>
                    </button>
                  )}
                </>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Search applicants..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                  />
                  {searchQuery && (
                    <button
                      className={styles.clearSearch}
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear search"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        style={{ width: "1rem", height: "1rem" }}
                      >
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                      </svg>
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Chat List or Applicant Search Results */}
            <div className={styles.chatList}>
              {activeTab === "new" ? (
                // Show applicant search results for "Start New Chat" tab
                <>
                  {!applicantSearchQuery.trim() ? (
                    <div className={styles.emptyState}>
                      <p>Type to search for applicants...</p>
                      <small
                        style={{
                          color: "var(--text-light)",
                          marginTop: "0.5rem",
                        }}
                      >
                        Search by name or phone number
                      </small>
                    </div>
                  ) : loadingSearch ? (
                    <div className={styles.emptyState}>
                      <BlocksWave width={32} height={32} />
                      <p style={{ marginTop: "0.5rem" }}>Searching...</p>
                    </div>
                  ) : searchedApplicants.length === 0 ? (
                    <div className={styles.emptyState}>
                      <p>
                        No applicants found for &quot;{applicantSearchQuery}
                        &quot;
                      </p>
                    </div>
                  ) : (
                    searchedApplicants.map((applicant) => (
                      <div key={applicant.id} className={styles.chatItem}>
                        <div className={styles.chatItemHeader}>
                          <strong>{applicant.name}</strong>
                        </div>
                        <div className={styles.chatItemEmail}>
                          {applicant.email}
                        </div>
                        <Button
                          variant="primary"
                          onClick={() =>
                            handleInitiateChat(applicant.id, applicant.name)
                          }
                          disabled={initiatingChat}
                          className={styles.acceptButton}
                        >
                          {initiatingChat ? "Starting..." : "Start Chat"}
                        </Button>
                      </div>
                    ))
                  )}
                </>
              ) : filteredChats.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>
                    {searchQuery
                      ? `No results for "${searchQuery}"`
                      : `No ${activeTab} chats`}
                  </p>
                </div>
              ) : (
                filteredChats.map((request) => (
                  <div
                    key={request.id}
                    className={`${styles.chatItem} ${
                      activeChat?.id === request.id ? styles.selected : ""
                    }`}
                    onClick={() => setActiveChat(request)}
                  >
                    <div className={styles.chatItemHeader}>
                      <strong>{request.userName}</strong>

                      {/* Format timezones to correctly use GMT+8 (PH Time) */}
                      <span className={styles.timestamp}>
                        {request.timestamp.toLocaleTimeString("en-PH", {
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "Asia/Manila",
                        })}
                      </span>
                    </div>
                    <div className={styles.chatItemEmail}>
                      {request.userEmail}
                    </div>
                    {request.concern && (
                      <div className={styles.chatItemConcern}>
                        {request.concern.length > 60
                          ? request.concern.substring(0, 60) + "..."
                          : request.concern}
                      </div>
                    )}
                    {activeTab === "pending" && (
                      <Button
                        variant="success"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptChat(request);
                        }}
                        className={styles.acceptButton}
                      >
                        Accept Chat
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className={styles.chatWindow}>
            {activeChat ? (
              <>
                <div className={styles.chatHeader}>
                  <div>
                    <h3>{activeChat.userName}</h3>
                    <p className={styles.chatEmail}>{activeChat.userEmail}</p>
                    {activeChat.concern && (
                      <div className={styles.concernBox}>
                        <strong>Concern:</strong> {activeChat.concern}
                      </div>
                    )}
                  </div>
                  {activeTab === "active" && (
                    <Button variant="danger" onClick={handleEndChat}>
                      End Chat
                    </Button>
                  )}
                </div>

                <div className={styles.messages}>
                  {loadingMessages ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: "200px",
                        flexDirection: "column",
                        gap: "0.5rem",
                      }}
                    >
                      <BlocksWave width={48} height={48} />
                      <p
                        style={{
                          margin: 0,
                          color: "var(--accent)",
                          fontSize: "0.9rem",
                        }}
                      >
                        Loading conversation...
                      </p>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`${styles.message} ${styles[msg.sender]}`}
                        >
                          <div className={styles.messageContent}>
                            {msg.text}
                          </div>
                          <div className={styles.messageTime}>
                            {msg.timestamp.toLocaleTimeString("en-PH", {
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone: "Asia/Manila",
                            })}
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                      {userTyping && (
                        <div className={styles.typingIndicator}>
                          <div className={styles.typingDots}>
                            <span className={styles.typingDot}></span>
                            <span className={styles.typingDot}></span>
                            <span className={styles.typingDot}></span>
                          </div>
                          <span className={styles.typingText}>
                            User is typing...
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {activeTab === "active" && (
                  <div className={styles.inputContainer}>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Type your message..."
                      value={inputValue}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSendMessage();
                        }
                      }}
                    />
                    <button
                      className={styles.sendButton}
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim()}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className={styles.sendIcon}
                      >
                        <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.noChat}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={styles.noChatIcon}
                >
                  <path
                    fillRule="evenodd"
                    d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223Z"
                    clipRule="evenodd"
                  />
                </svg>
                <p>Select a chat to view messages</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Toast
        show={toast.show}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        title={toast.title}
        message={toast.message}
        type={toast.type}
      />
    </>
  );
}

export default AdminChatPanel;

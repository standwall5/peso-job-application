"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import styles from "./ChatWidget.module.css";
import { User } from "@supabase/supabase-js";

interface Message {
  id: string;
  text: string;
  sender: "user" | "admin" | "bot";
  timestamp: Date;
  buttons?: Array<{ label: string; value: string }>;
}

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
}

interface ChatSession {
  id: string;
  user_id: number;
  status: "pending" | "active" | "closed";
  concern?: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  admin_id: number | null;
  last_user_message_at: string | null;
}

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatWidget({ isOpen, onClose }: ChatWidgetProps) {
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<
    "menu" | "faq" | "concern" | "live" | "history"
  >("menu");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [concernValue, setConcernValue] = useState("");
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [chatStatus, setChatStatus] = useState<
    "waiting" | "connected" | "closed"
  >("waiting");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [adminTyping, setAdminTyping] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [hasChatHistory, setHasChatHistory] = useState(false);
  const [sessionExpiryTime, setSessionExpiryTime] = useState<number | null>(
    null,
  );
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const messageSubscriptionRef = useRef<ReturnType<
    typeof supabase.channel
  > | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(
    null,
  );
  const expiryCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/getUser");
      const data = await res.json();
      setUser(data && !data.error ? data : null);
    }

    fetchUser();
  }, []);

  // Load active session and chat history when widget opens
  useEffect(() => {
    if (isOpen && user) {
      loadActiveSession();
      loadChatHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user]);

  // Check for session expiry every second
  useEffect(() => {
    if (sessionExpiryTime && hasActiveSession) {
      expiryCheckIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const timeRemaining = sessionExpiryTime - now;

        // Show warning when 30 seconds remain
        if (timeRemaining <= 30000 && timeRemaining > 0) {
          setShowExpiryWarning(true);
        } else {
          setShowExpiryWarning(false);
        }

        // Session expired
        if (timeRemaining <= 0) {
          handleSessionExpired();
        }
      }, 1000);

      return () => {
        if (expiryCheckIntervalRef.current) {
          clearInterval(expiryCheckIntervalRef.current);
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionExpiryTime, hasActiveSession]);

  // Load messages for a session
  const loadMessages = async (chatSessionId: string) => {
    try {
      const response = await fetch(
        `/api/chat/messages?sessionId=${chatSessionId}`,
      );
      const data = await response.json();

      if (response.ok && data.messages) {
        const loadedMessages: Message[] = data.messages.map(
          (msg: {
            id: number | string;
            message: string;
            sender: string;
            created_at: string;
          }) => {
            const parsed = parseMessage(msg.message);
            return {
              id: msg.id,
              text: parsed.text,
              sender: msg.sender as "user" | "admin" | "bot",
              timestamp: new Date(msg.created_at),
              buttons: parsed.buttons,
            };
          },
        );
        setMessages(loadedMessages);
      }
    } catch (error) {
      console.error("[ChatWidget] Error loading messages:", error);
    }
  };

  // Load active chat session
  const loadActiveSession = async () => {
    try {
      const response = await fetch("/api/chat/active-session");
      const data = await response.json();

      if (response.ok && data.session) {
        setSessionId(data.session.id);
        setHasActiveSession(true);
        setMode("live");
        setChatStatus(
          data.session.status === "active" ? "connected" : "waiting",
        );

        // Calculate expiry time (2 minutes from last user message)
        if (data.session.last_user_message_at) {
          const lastMessageTime = new Date(
            data.session.last_user_message_at,
          ).getTime();
          const expiryTime = lastMessageTime + 2 * 60 * 1000; // 2 minutes
          setSessionExpiryTime(expiryTime);
        }

        // Load messages for this session
        await loadMessages(data.session.id);
      } else {
        setHasActiveSession(false);
      }
    } catch (error) {
      console.error("[ChatWidget] Error loading active session:", error);
    }
  };

  // Load chat history
  const loadChatHistory = async () => {
    try {
      const response = await fetch("/api/chat/history");
      const data = await response.json();

      if (response.ok && data.sessions && data.sessions.length > 0) {
        setChatHistory(data.sessions);
        setHasChatHistory(true);
      } else {
        setHasChatHistory(false);
      }
    } catch (error) {
      console.error("[ChatWidget] Error loading chat history:", error);
    }
  };

  // Handle session expiry
  const handleSessionExpired = () => {
    if (expiryCheckIntervalRef.current) {
      clearInterval(expiryCheckIntervalRef.current);
    }

    // Clear active session state
    setHasActiveSession(false);
    setSessionExpiryTime(null);
    setShowExpiryWarning(false);
    setChatStatus("closed");

    // Unsubscribe from real-time channels
    if (messageSubscriptionRef.current) {
      supabase.removeChannel(messageSubscriptionRef.current);
      messageSubscriptionRef.current = null;
    }
    if (typingChannelRef.current) {
      supabase.removeChannel(typingChannelRef.current);
      typingChannelRef.current = null;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: "system-timeout",
        text: "This chat has been closed due to inactivity (2 minutes without response).",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);

    // Reload chat history to include this session
    loadChatHistory();
  };

  // Handle closing the chat widget (don't close session, just hide widget)
  const handleCloseChat = () => {
    console.log("[ChatWidget] Closing widget without ending session");

    // Don't reset state - session persists for 2 minutes
    // Just close the widget
    onClose();
  };

  // Handle ending chat (explicit button click)
  const handleEndChat = async () => {
    if (!sessionId) return;

    try {
      console.log("[ChatWidget] User ending chat:", sessionId);
      const response = await fetch("/api/chat/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (response.ok) {
        // Clear active session state
        setHasActiveSession(false);
        setSessionExpiryTime(null);
        setShowExpiryWarning(false);
        setChatStatus("closed");

        // Clear interval
        if (expiryCheckIntervalRef.current) {
          clearInterval(expiryCheckIntervalRef.current);
        }

        // Unsubscribe from real-time channels
        if (messageSubscriptionRef.current) {
          supabase.removeChannel(messageSubscriptionRef.current);
          messageSubscriptionRef.current = null;
        }
        if (typingChannelRef.current) {
          supabase.removeChannel(typingChannelRef.current);
          typingChannelRef.current = null;
        }

        setMessages((prev) => [
          ...prev,
          {
            id: "system-closed",
            text: "Chat has been ended. Thank you for contacting PESO!",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);

        // Reload chat history
        loadChatHistory();
      } else {
        console.error("[ChatWidget] Failed to end chat");
      }
    } catch (error) {
      console.error("[ChatWidget] Error ending chat:", error);
    }
  };

  // Fetch FAQs
  useEffect(() => {
    if (mode === "faq") {
      fetchFAQs();
    }
  }, [mode]);

  // Parse buttons from message text
  const parseMessage = (text: string) => {
    const buttonMarker = "\n\n[BUTTONS]";
    if (text.includes(buttonMarker)) {
      const [messageText, buttonsJson] = text.split(buttonMarker);
      try {
        const buttons = JSON.parse(buttonsJson);
        return { text: messageText, buttons };
      } catch {
        return { text, buttons: undefined };
      }
    }
    return { text, buttons: undefined };
  };

  // Set up real-time subscription for messages and typing
  useEffect(() => {
    if (sessionId && mode === "live") {
      subscribeToMessages(sessionId);
      subscribeToTyping(sessionId);
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
  }, [sessionId, mode]);

  // Subscribe to real-time messages
  const subscribeToMessages = async (chatId: string) => {
    if (!chatId) return;

    // Remove existing subscription if any
    if (messageSubscriptionRef.current) {
      await supabase.removeChannel(messageSubscriptionRef.current);
    }

    // Create new subscription
    const channel = supabase
      .channel(`messages:${chatId}`)
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
            message: string;
            sender: string;
            created_at: string;
          };
          const parsed = parseMessage(newMsg.message);
          const message: Message = {
            id: newMsg.id,
            text: parsed.text,
            sender: newMsg.sender as "user" | "admin",
            timestamp: new Date(newMsg.created_at),
            buttons: parsed.buttons,
          };
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === message.id)) {
              return prev;
            }
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
          };
          if (updatedSession.status === "active") {
            setChatStatus("connected");
            setMessages((prev) => [
              ...prev.filter((m) => m.sender !== "bot"),
              {
                id: "system-connected",
                text: "Admin has joined the chat. You can now send messages.",
                sender: "bot",
                timestamp: new Date(),
              },
            ]);
          } else if (updatedSession.status === "closed") {
            // Clear active session state
            setHasActiveSession(false);
            setSessionExpiryTime(null);
            setShowExpiryWarning(false);
            setChatStatus("closed");

            // Clear interval
            if (expiryCheckIntervalRef.current) {
              clearInterval(expiryCheckIntervalRef.current);
            }

            setMessages((prev) => [
              ...prev,
              {
                id: "system-closed",
                text: "This chat has been closed by the admin.",
                sender: "bot",
                timestamp: new Date(),
              },
            ]);

            // Reload chat history
            loadChatHistory();
          }
        },
      )
      .subscribe();

    messageSubscriptionRef.current = channel;
  };

  // Subscribe to typing indicators
  const subscribeToTyping = async (chatId: string) => {
    console.log("[ChatWidget] Setting up typing subscription for:", chatId);
    if (!chatId) return;

    if (typingChannelRef.current) {
      console.log("[ChatWidget] Removing old typing channel");
      await supabase.removeChannel(typingChannelRef.current);
    }

    const channel = supabase
      .channel(`typing:${chatId}`)
      .on("broadcast", { event: "typing" }, (payload) => {
        console.log("[ChatWidget] Typing broadcast received:", payload);
        if (payload.payload.sender === "admin") {
          console.log("[ChatWidget] Admin is typing!");
          setAdminTyping(true);
          // Clear typing indicator after 3 seconds
          setTimeout(() => {
            console.log("[ChatWidget] Clearing admin typing indicator");
            setAdminTyping(false);
          }, 3000);
        }
      })
      .subscribe((status) => {
        console.log("[ChatWidget] Typing channel subscription status:", status);
      });

    typingChannelRef.current = channel;
    console.log("[ChatWidget] Typing subscription created");
  };

  // Send typing indicator
  const sendTypingIndicator = () => {
    console.log("[ChatWidget] sendTypingIndicator called", {
      hasSessionId: !!sessionId,
      hasChannel: !!typingChannelRef.current,
    });

    if (!sessionId || !typingChannelRef.current) {
      console.log(
        "[ChatWidget] Cannot send typing - missing sessionId or channel",
      );
      return;
    }

    console.log("[ChatWidget] Broadcasting typing event");
    typingChannelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: { sender: "user", sessionId },
    });
  };

  // Handle input change with typing indicator
  const handleInputChange = (value: string) => {
    console.log("[ChatWidget] Input changed, length:", value.length);
    setInputValue(value);

    // Send typing indicator
    sendTypingIndicator();

    // Debounce typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const fetchFAQs = async () => {
    try {
      const response = await fetch("/api/chat/faqs");
      const data = await response.json();
      setFaqs(data || []);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      setFaqs([
        {
          id: "1",
          category: "General",
          question: "How do I apply for a job?",
          answer:
            "You can apply for a job by browsing our job opportunities page and clicking the 'Apply' button on any job listing.",
        },
        {
          id: "2",
          category: "General",
          question: "How do I update my profile?",
          answer:
            "Go to your Profile page and click the 'Edit' button to update your information.",
        },
        {
          id: "3",
          category: "Applications",
          question: "How can I track my applications?",
          answer:
            "Visit your Profile page and click on 'Applied Jobs' to see all your applications and their status.",
        },
      ]);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle button click - send button value as user message
  const handleButtonClick = async (value: string) => {
    if (!sessionId) return;

    // Send message directly via API
    try {
      await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: value,
        }),
      });
      // Message will appear via real-time subscription
    } catch (error) {
      console.error("Error sending button click:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !sessionId) return;

    const messageText = inputValue;
    setInputValue("");

    if (mode === "live") {
      // Send message to admin via API
      try {
        await fetch("/api/chat/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            message: messageText,
          }),
        });

        // Reset session expiry time (2 minutes from now)
        const newExpiryTime = Date.now() + 2 * 60 * 1000;
        setSessionExpiryTime(newExpiryTime);
        setShowExpiryWarning(false);

        // Message will appear via real-time subscription
      } catch (error) {
        console.error("Error sending message:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: "error-" + Date.now(),
            text: "Failed to send message. Please try again.",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      }
    }
  };

  const handleSubmitConcern = async () => {
    if (!concernValue.trim()) {
      alert("Please describe your concern before starting a chat.");
      return;
    }

    setMode("live");
    setChatStatus("waiting");

    // Send chat request with initial concern to admin
    try {
      const response = await fetch("/api/chat/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concern: concernValue.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.id) {
        setSessionId(data.id);
        setHasActiveSession(true);

        // Set expiry time (2 minutes from now)
        const expiryTime = Date.now() + 2 * 60 * 1000;
        setSessionExpiryTime(expiryTime);

        setMessages([
          {
            id: "user-concern",
            text: concernValue.trim(),
            sender: "user",
            timestamp: new Date(),
          },
          {
            id: "system-1",
            text: "Your message has been sent to our support team. Please wait while an admin reviews your request...",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
        setConcernValue("");
      } else {
        setMessages([
          {
            id: "system-error",
            text: "Failed to start chat. Please try again.",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
        setMode("concern");
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      setMessages([
        {
          id: "system-error",
          text: "Failed to start chat. Please try again.",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
      setMode("concern");
    }
  };

  const handleFAQClick = (faq: FAQ) => {
    setMessages([
      {
        id: Date.now().toString(),
        text: faq.question,
        sender: "user",
        timestamp: new Date(),
      },
      {
        id: (Date.now() + 1).toString(),
        text: faq.answer,
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  };

  const categories = Array.from(new Set(faqs.map((faq) => faq.category)));

  if (!isOpen) return null;

  return (
    <div className={styles.chatWidget}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          {mode !== "menu" && mode !== "concern" && (
            <button
              className={styles.backButton}
              onClick={() => {
                setMode("menu");
                setMessages([]);
                setSelectedCategory(null);
                setConcernValue("");
                if (messageSubscriptionRef.current) {
                  supabase.removeChannel(messageSubscriptionRef.current);
                }
                setSessionId(null);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={styles.backIcon}
              >
                <path
                  fillRule="evenodd"
                  d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
          <h3 className={styles.title}>
            {mode === "menu" && "How can we help?"}
            {mode === "faq" && "FAQ"}
            {mode === "concern" && "Describe Your Concern"}
            {mode === "live" && (
              <>
                Live Chat
                {chatStatus === "waiting" && (
                  <span className={styles.statusBadge}>Waiting...</span>
                )}
                {chatStatus === "connected" && (
                  <span className={`${styles.statusBadge} ${styles.connected}`}>
                    Connected
                  </span>
                )}
                {chatStatus === "closed" && (
                  <span className={`${styles.statusBadge} ${styles.closed}`}>
                    Closed
                  </span>
                )}
              </>
            )}
          </h3>
        </div>
        <button
          className={styles.closeButton}
          onClick={() => {
            // If chat is closed, go back to menu
            if (chatStatus === "closed" && mode === "live") {
              setMode("menu");
              setMessages([]);
              setChatStatus("waiting");
            } else {
              handleCloseChat();
            }
          }}
        >
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

      {/* Content */}
      <div className={styles.content}>
        {/* Menu View */}
        {mode === "menu" && (
          <div className={styles.menu}>
            <button
              className={styles.menuOption}
              onClick={() => setMode("faq")}
            >
              <div className={styles.menuIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className={styles.menuText}>
                <strong>Frequently Asked Questions</strong>
                <span>Get instant answers</span>
              </div>
            </button>

            {user && !hasActiveSession && (
              <button
                className={styles.menuOption}
                onClick={() => setMode("concern")}
              >
                <div className={styles.menuIcon}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223ZM8.25 10.875a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.875 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className={styles.menuText}>
                  <strong>Chat with Admin</strong>
                  <span>Talk to a real person</span>
                </div>
              </button>
            )}

            {user && hasActiveSession && (
              <button
                className={styles.menuOption}
                onClick={() => {
                  setMode("live");
                }}
              >
                <div className={styles.menuIcon}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {showExpiryWarning && (
                    <span className={styles.expiryBadge}>!</span>
                  )}
                </div>
                <div className={styles.menuText}>
                  <strong>Active Chat</strong>
                  <span>Continue your conversation</span>
                </div>
              </button>
            )}

            {user && hasChatHistory && (
              <button
                className={styles.menuOption}
                onClick={() => setMode("history")}
              >
                <div className={styles.menuIcon}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className={styles.menuText}>
                  <strong>Chat History</strong>
                  <span>View past conversations</span>
                </div>
              </button>
            )}
          </div>
        )}

        {/* Concern Input View */}
        {mode === "concern" && (
          <div className={styles.concernForm}>
            <p className={styles.concernPrompt}>
              Please describe your concern or question below, and our support
              team will assist you shortly.
            </p>
            <textarea
              className={styles.concernTextarea}
              placeholder="Example: I need help with my job application status..."
              value={concernValue}
              onChange={(e) => setConcernValue(e.target.value)}
              rows={6}
              autoFocus
            />
            <button
              className={styles.submitConcernButton}
              onClick={handleSubmitConcern}
              disabled={!concernValue.trim()}
            >
              Send Request to Admin
            </button>
          </div>
        )}

        {/* FAQ View */}
        {mode === "faq" && (
          <div className={styles.faqContent}>
            {messages.length === 0 ? (
              <>
                <div className={styles.categories}>
                  {categories.map((category) => (
                    <button
                      key={category}
                      className={styles.categoryButton}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <div className={styles.faqList}>
                  {faqs
                    .filter(
                      (faq) =>
                        !selectedCategory || faq.category === selectedCategory,
                    )
                    .map((faq) => (
                      <button
                        key={faq.id}
                        className={styles.faqItem}
                        onClick={() => handleFAQClick(faq)}
                      >
                        <span className={styles.faqQuestion}>
                          {faq.question}
                        </span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className={styles.arrowIcon}
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    ))}
                </div>
              </>
            ) : (
              <div className={styles.messages}>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`${styles.message} ${styles[msg.sender]}`}
                  >
                    <div className={styles.messageContent}>
                      {msg.text}
                      {msg.buttons && msg.buttons.length > 0 && (
                        <div className={styles.buttonContainer}>
                          {msg.buttons.map((button, idx) => (
                            <button
                              key={idx}
                              className={styles.botButton}
                              onClick={() => handleButtonClick(button.value)}
                            >
                              {button.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        )}

        {/* Chat History View */}
        {mode === "history" && (
          <div className={styles.historyContent}>
            <p className={styles.historyTitle}>Past Conversations</p>
            <div className={styles.historyList}>
              {chatHistory.map((session) => (
                <div
                  key={session.id}
                  className={styles.historyItem}
                  onClick={async () => {
                    setSessionId(session.id);
                    setMode("live");
                    setChatStatus("closed");
                    setHasActiveSession(false);
                    await loadMessages(session.id);
                  }}
                >
                  <div className={styles.historyItemHeader}>
                    <strong>{session.concern || "Chat Session"}</strong>
                    <span className={styles.historyDate}>
                      {new Date(session.created_at).toLocaleDateString(
                        "en-PH",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                  <div className={styles.historyItemFooter}>
                    <span className={styles.historyStatus}>Closed</span>
                    {session.closed_at && (
                      <span className={styles.historyTime}>
                        {new Date(session.closed_at).toLocaleTimeString(
                          "en-PH",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Chat View */}
        {mode === "live" && (
          <div className={styles.chatContent}>
            {/* Session Expiry Warning */}
            {showExpiryWarning && chatStatus !== "closed" && (
              <div className={styles.timeoutWarning}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  ⚠️ Your session will expire in 30 seconds due to inactivity.
                  Send a message to keep it active.
                </span>
              </div>
            )}

            <div className={styles.messages}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`${styles.message} ${styles[msg.sender]}`}
                >
                  <div className={styles.messageContent}>
                    {msg.text}
                    {msg.buttons && msg.buttons.length > 0 && (
                      <div className={styles.buttonContainer}>
                        {msg.buttons.map((button, idx) => (
                          <button
                            key={idx}
                            className={styles.botButton}
                            onClick={() => handleButtonClick(button.value)}
                          >
                            {button.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className={styles.messageTime}>
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            {adminTyping && (
              <div className={styles.typingIndicator}>
                <span className={styles.typingDot}></span>
                <span className={styles.typingDot}></span>
                <span className={styles.typingDot}></span>
                <span className={styles.typingText}>Admin is typing...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input (for live chat only when connected) */}
      {mode === "live" && chatStatus === "connected" && (
        <>
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
          <div className={styles.endChatContainer}>
            <button className={styles.endChatButton} onClick={handleEndChat}>
              End Chat
            </button>
          </div>
        </>
      )}

      {/* Show message when chat is closed */}
      {mode === "live" && chatStatus === "closed" && (
        <div className={styles.closedChatInfo}>
          <p>
            This chat has ended. Click the back button to return to the menu.
          </p>
          <button
            className={styles.backToMenuButton}
            onClick={() => {
              setMode("menu");
              setMessages([]);
              setChatStatus("waiting");
            }}
          >
            Back to Menu
          </button>
        </div>
      )}

      {/* FAQ Input (for FAQ with messages) */}
      {mode === "faq" && messages.length > 0 && (
        <div className={styles.inputContainer}>
          <button
            className={styles.backToFAQButton}
            onClick={() => setMessages([])}
          >
            ← Back to FAQ List
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import styles from "./AdminChatPanel.module.css";
import Button from "../Button";

interface ChatRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  concern: string;
  timestamp: Date;
  status: "pending" | "active" | "closed";
}

interface Message {
  id: string;
  chatId: string;
  text: string;
  sender: "user" | "admin";
  timestamp: Date;
}

interface AdminChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  pendingChats: ChatRequest[];
  activeChats: ChatRequest[];
  closedChats: ChatRequest[];
  onRefresh: () => void;
}

export default function AdminChatPanel({
  isOpen,
  onClose,
  pendingChats,
  activeChats,
  closedChats,
  onRefresh,
}: AdminChatPanelProps) {
  const [activeTab, setActiveTab] = useState<"pending" | "active" | "closed">(
    "pending",
  );
  const [activeChat, setActiveChat] = useState<ChatRequest | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const supabase = createClient();
  const messageSubscriptionRef = useRef<ReturnType<
    typeof supabase.channel
  > | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get chat requests for current tab from props
  const chatRequests =
    activeTab === "pending"
      ? pendingChats
      : activeTab === "active"
        ? activeChats
        : closedChats;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Set up real-time subscription for messages
  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id);
      subscribeToMessages(activeChat.id);
    }

    return () => {
      if (messageSubscriptionRef.current) {
        supabase.removeChannel(messageSubscriptionRef.current);
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
      .subscribe();

    messageSubscriptionRef.current = channel;
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const response = await fetch(`/api/admin/chat/messages/${chatId}`);
      const data = await response.json();

      // Map database messages to component format
      const mappedMessages = (data || []).map(
        (msg: {
          id: string;
          chat_session_id: string;
          message: string;
          sender: string;
          created_at: string;
        }) => ({
          id: msg.id,
          chatId: msg.chat_session_id,
          text: msg.message,
          sender: msg.sender as "user" | "admin",
          timestamp: new Date(msg.created_at),
        }),
      );

      setMessages(mappedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    }
  };

  const handleAcceptChat = async (request: ChatRequest) => {
    try {
      const response = await fetch(`/api/admin/chat/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: request.id }),
      });

      if (response.ok) {
        // Update request status locally
        const updatedRequest = { ...request, status: "active" as const };
        setActiveChat(updatedRequest);
        setActiveTab("active");
        // Refresh data to ensure UI is in sync
        onRefresh();
      } else {
        // Log the error details
        const errorData = await response.json();
        console.error("Error accepting chat:", {
          status: response.status,
          error: errorData,
          chatId: request.id,
          currentStatus: request.status,
        });
        alert(`Failed to accept chat: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error accepting chat:", error);
      alert("Failed to accept chat. Please try again.");
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
      const response = await fetch("/api/admin/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: activeChat.id,
          message: messageText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      // Get the real message from response
      const data = await response.json();
      console.log("[AdminChatPanel] Message sent successfully:", {
        realMessageId: data.id,
        optimisticId: optimisticMessageId,
      });

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
      const response = await fetch(`/api/admin/chat/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: activeChat.id }),
      });

      if (response.ok) {
        setActiveChat(null);
        setMessages([]);
        setActiveTab("closed");
        // Refresh data to ensure UI is in sync
        onRefresh();
      }
    } catch (error) {
      console.error("Error ending chat:", error);
    }
  };

  // Badge counts are now passed from parent via props
  const newChatsCount = pendingChats.length;
  const activeChatsCount = activeChats.length;

  if (!isOpen) return null;

  return (
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
          </div>

          {/* Chat List */}
          <div className={styles.chatList}>
            {(() => {
              console.log("[AdminChatPanel] Rendering chat list:", {
                activeTab,
                chatRequestsLength: chatRequests.length,
                chatRequestsStatuses: chatRequests.map((r) => r.status),
              });
              return null;
            })()}
            {chatRequests.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No {activeTab} chats</p>
              </div>
            ) : (
              chatRequests.map((request) => (
                <div
                  key={request.id}
                  className={`${styles.chatItem} ${
                    activeChat?.id === request.id ? styles.selected : ""
                  }`}
                  onClick={() => setActiveChat(request)}
                >
                  <div className={styles.chatItemHeader}>
                    <strong>{request.userName}</strong>
                    <span className={styles.timestamp}>
                      {request.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
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
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`${styles.message} ${styles[msg.sender]}`}
                  >
                    <div className={styles.messageContent}>{msg.text}</div>
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

              {activeTab === "active" && (
                <div className={styles.inputContainer}>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Type your message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
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
  );
}

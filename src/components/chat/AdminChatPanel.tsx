"use client";

import React, { useState, useEffect } from "react";
import styles from "./AdminChatPanel.module.css";
import Button from "../Button";

interface ChatRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
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
}

export default function AdminChatPanel({
  isOpen,
  onClose,
}: AdminChatPanelProps) {
  const [activeTab, setActiveTab] = useState<"new" | "active" | "closed">(
    "new",
  );
  const [chatRequests, setChatRequests] = useState<ChatRequest[]>([]);
  const [activeChat, setActiveChat] = useState<ChatRequest | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");

  // Fetch chat requests
  useEffect(() => {
    if (isOpen) {
      fetchChatRequests();
    }
  }, [isOpen, activeTab]);

  const fetchChatRequests = async () => {
    try {
      const response = await fetch(
        `/api/admin/chat/requests?status=${activeTab}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch chat requests");
      }

      const data = await response.json();
      setChatRequests(data || []);
    } catch (error) {
      console.error("Error fetching chat requests:", error);
      // Mock data for development
      setChatRequests([
        {
          id: "1",
          userId: "user-1",
          userName: "John Doe",
          userEmail: "john@example.com",
          timestamp: new Date(),
          status: "pending",
        },
      ]);
    }
  };

  // Fetch messages for active chat
  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id);
    }
  }, [activeChat]);

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
        fetchChatRequests();
      }
    } catch (error) {
      console.error("Error accepting chat:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !activeChat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      chatId: activeChat.id,
      text: inputValue,
      sender: "admin",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    try {
      const response = await fetch("/api/admin/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: activeChat.id,
          message: inputValue,
        }),
      });

      if (response.ok) {
        // Refresh messages to show the new one
        await fetchMessages(activeChat.id);
      }
    } catch (error) {
      console.error("Error sending message:", error);
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
        fetchChatRequests();
      }
    } catch (error) {
      console.error("Error ending chat:", error);
    }
  };

  const newChatsCount = chatRequests.filter(
    (c) => c.status === "pending",
  ).length;
  const activeChatsCount = chatRequests.filter(
    (c) => c.status === "active",
  ).length;

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
              className={`${styles.tab} ${activeTab === "new" ? styles.active : ""}`}
              onClick={() => {
                setActiveTab("new");
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
                  {activeTab === "new" && (
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

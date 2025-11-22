"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./ChatWidget.module.css";

interface Message {
  id: string;
  text: string;
  sender: "user" | "admin" | "bot";
  timestamp: Date;
}

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
}

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatWidget({ isOpen, onClose }: ChatWidgetProps) {
  const [mode, setMode] = useState<"menu" | "faq" | "live">("menu");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [chatStatus, setChatStatus] = useState<
    "waiting" | "connected" | "closed"
  >("waiting");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch FAQs
  useEffect(() => {
    if (mode === "faq") {
      fetchFAQs();
    }
  }, [mode]);

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

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !sessionId) return;

    const messageText = inputValue;
    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
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
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handleStartLiveChat = async () => {
    setMode("live");
    setChatStatus("waiting");

    // Send chat request to admin
    try {
      const response = await fetch("/api/chat/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (response.ok && data.id) {
        setSessionId(data.id);
        setMessages([
          {
            id: "system-1",
            text: "Your chat request has been sent. Please wait for an admin to accept...",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);

        // Poll for session status updates
        pollSessionStatus();
      } else {
        setMessages([
          {
            id: "system-error",
            text: "Failed to start chat. Please try again.",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
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
    }
  };

  const pollSessionStatus = async () => {
    // Poll every 3 seconds to check if admin accepted
    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/chat/messages");
        const data = await response.json();

        if (data.sessionId && data.messages) {
          // Check if session is active by looking at messages or session data
          // For now, we'll assume if we get messages back, it's connected
          if (data.messages.length > messages.length) {
            setChatStatus("connected");
            setMessages(
              data.messages.map(
                (msg: {
                  id: string;
                  message: string;
                  sender: string;
                  created_at: string;
                }) => ({
                  id: msg.id,
                  text: msg.message,
                  sender: msg.sender as "user" | "admin" | "bot",
                  timestamp: new Date(msg.created_at),
                }),
              ),
            );
          }
        }
      } catch (error) {
        console.error("Error polling messages:", error);
      }
    }, 3000);

    // Clean up interval after 5 minutes
    setTimeout(() => clearInterval(interval), 300000);
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
          {mode !== "menu" && (
            <button
              className={styles.backButton}
              onClick={() => {
                setMode("menu");
                setMessages([]);
                setSelectedCategory(null);
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
              </>
            )}
          </h3>
        </div>
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

            <button className={styles.menuOption} onClick={handleStartLiveChat}>
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
                    <div className={styles.messageContent}>{msg.text}</div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        )}

        {/* Live Chat View */}
        {mode === "live" && (
          <div className={styles.chatContent}>
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
          </div>
        )}
      </div>

      {/* Input (for live chat and FAQ with messages) */}
      {(mode === "live" || (mode === "faq" && messages.length > 0)) && (
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
    </div>
  );
}

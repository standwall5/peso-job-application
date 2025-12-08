"use client";

import React, { useState } from "react";

interface NotificationTestButtonProps {
  className?: string;
  style?: React.CSSProperties;
}

const NotificationTestButton: React.FC<NotificationTestButtonProps> = ({
  className,
  style,
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const sendTestNotification = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/notifications/test", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setMessage("✅ Test notification sent!");
        console.log("Test notification created:", data.notification);
      } else {
        setMessage(`❌ Error: ${data.error || "Failed to send notification"}`);
      }
    } catch (error) {
      console.error("Error sending test notification:", error);
      setMessage("❌ Network error");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const checkSystemStatus = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/notifications/test", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setMessage(
          `✅ System OK - ${data.notifications_count} notifications`,
        );
        console.log("System status:", data);
      } else {
        setMessage(`❌ Error: ${data.error || data.message}`);
        console.error("System error:", data);
      }
    } catch (error) {
      console.error("Error checking status:", error);
      setMessage("❌ Network error");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 9999,
        backgroundColor: "white",
        padding: "15px",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        border: "1px solid #e0e0e0",
        ...style,
      }}
      className={className}
    >
      <div style={{ marginBottom: "10px", fontWeight: "bold", fontSize: "14px" }}>
        🔔 Notification Tester
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <button
          onClick={sendTestNotification}
          disabled={loading}
          style={{
            padding: "8px 16px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "13px",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Sending..." : "Send Test Notification"}
        </button>

        <button
          onClick={checkSystemStatus}
          disabled={loading}
          style={{
            padding: "8px 16px",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "13px",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Checking..." : "Check System Status"}
        </button>
      </div>

      {message && (
        <div
          style={{
            marginTop: "10px",
            padding: "8px",
            backgroundColor: message.startsWith("✅") ? "#e8f5e9" : "#ffebee",
            borderRadius: "4px",
            fontSize: "12px",
            color: message.startsWith("✅") ? "#2e7d32" : "#c62828",
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          marginTop: "10px",
          fontSize: "11px",
          color: "#666",
          borderTop: "1px solid #e0e0e0",
          paddingTop: "8px",
        }}
      >
        💡 Check browser console for detailed logs
      </div>
    </div>
  );
};

export default NotificationTestButton;

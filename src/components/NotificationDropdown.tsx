"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import styles from "./NotificationDropdown.module.css";

interface Notification {
  id: number; // Changed from string to number (BIGSERIAL)
  applicant_id: number; // Changed from string to number
  type: "application_update" | "new_job" | "exam_result" | "admin_message";
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  onUnreadCountChange,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [applicantId, setApplicantId] = useState<number | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Cache duration: 30 seconds
  const CACHE_DURATION = 30000;

  const fetchNotifications = useCallback(
    async (forceRefresh: boolean = false) => {
      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchTime;

      // Skip fetch if cache is still valid and not forced
      if (
        !forceRefresh &&
        timeSinceLastFetch < CACHE_DURATION &&
        hasInitialLoad
      ) {
        return;
      }

      setLoading(true);
      try {
        const response = await fetch("/api/notifications");
        const data = await response.json();

        if (data.error) {
          console.error("Error fetching notifications:", data.error);
          setNotifications([]);
          return;
        }

        setNotifications(Array.isArray(data) ? data : []);
        const unread = data.filter((n: Notification) => !n.is_read).length;
        setUnreadCount(unread);
        setLastFetchTime(now);
        setHasInitialLoad(true);

        // Notify parent component about unread count
        if (onUnreadCountChange) {
          onUnreadCountChange(unread);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    },
    [onUnreadCountChange, lastFetchTime, hasInitialLoad],
  );

  // Get current user's applicant ID
  useEffect(() => {
    const getApplicantId = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: applicant } = await supabase
            .from("applicants")
            .select("id")
            .eq("auth_id", user.id)
            .single();

          if (applicant) {
            setApplicantId(applicant.id);
          }
        }
      } catch (error) {
        console.error("Error getting applicant ID:", error);
      }
    };

    getApplicantId();
  }, []);

  // Fetch notifications on mount (realtime will handle updates)
  useEffect(() => {
    fetchNotifications(false);
  }, [fetchNotifications]);

  // Refresh when dropdown opens (use cache if available)
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(false);
    }
  }, [isOpen, fetchNotifications]);

  // Real-time subscription to notifications
  useEffect(() => {
    if (!applicantId) return;

    const supabase = createClient();

    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `applicant_id=eq.${applicantId}`,
        },
        (payload) => {
          console.log("Notification change:", payload);
          fetchNotifications(true); // Force refresh on real-time update
        },
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
      });

    return () => {
      channel.unsubscribe();
    };
  }, [applicantId, fetchNotifications]);

  const markAsRead = async (notificationId: number) => {
    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notification_id: notificationId }),
      });
      fetchNotifications(true); // Force refresh after marking as read
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mark_all: true }),
      });
      fetchNotifications(true); // Force refresh after marking all as read
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      await fetch(`/api/notifications?id=${notificationId}`, {
        method: "DELETE",
      });
      fetchNotifications(true); // Force refresh after deletion
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleNotificationClick = (notif: Notification) => {
    // Mark as read if unread
    if (!notif.is_read) {
      markAsRead(notif.id);
    }

    // Handle navigation
    if (notif.type === "application_update") {
      // For application updates, navigate to profile with applications tab
      window.location.href = "/profile?tab=applications";
    } else if (notif.link) {
      // For other notifications with links
      window.location.href = notif.link;
    }

    onClose();
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "application_update":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={styles.icon}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
            />
          </svg>
        );
      case "new_job":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={styles.icon}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z"
            />
          </svg>
        );
      case "exam_result":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={styles.icon}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
            />
          </svg>
        );
      case "admin_message":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={styles.icon}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
            />
          </svg>
        );
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.notificationDropdown}>
      <div className={styles.header}>
        <h3>Notifications</h3>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className={styles.markAllBtn}>
            Mark all as read
          </button>
        )}
      </div>

      {loading && !hasInitialLoad ? (
        <div className={styles.loading}>Loading...</div>
      ) : notifications.length === 0 ? (
        <div className={styles.empty}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
            />
          </svg>
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className={styles.notificationList}>
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`${styles.notificationItem} ${!notif.is_read ? styles.unread : ""}`}
            >
              <div
                className={styles.notificationContent}
                onClick={() => handleNotificationClick(notif)}
              >
                <div className={styles.iconWrapper}>
                  {getNotificationIcon(notif.type)}
                </div>
                <div className={styles.content}>
                  <h4>{notif.title}</h4>
                  <p>{notif.message}</p>
                  <span className={styles.time}>
                    {formatTime(notif.created_at)}
                  </span>
                </div>
                {!notif.is_read && <div className={styles.unreadDot} />}
              </div>
              <button
                className={styles.deleteBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notif.id);
                }}
                aria-label="Delete notification"
                title="Delete notification"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;

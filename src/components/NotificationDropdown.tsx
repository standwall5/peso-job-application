"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import styles from "./NotificationDropdown.module.css";

interface Notification {
  id: number;
  applicant_id: number;
  type: "referred" | "rejected" | "id_verified" | "application_completed";
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
  job_id?: number;
  job_title?: string;
  company_name?: string;
  company_logo?: string;
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
  const [showArchived, setShowArchived] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Cache duration: 30 seconds
  const CACHE_DURATION = 30000;

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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
        const url = showArchived
          ? "/api/notifications?archived=true"
          : "/api/notifications";
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          console.error("Error fetching notifications:", data.error);
          showToast("Failed to load notifications", "error");
          setNotifications([]);
          return;
        }

        setNotifications(Array.isArray(data) ? data : []);
        const unread = data.filter(
          (n: Notification) => !n.is_read && !n.is_archived,
        ).length;
        setUnreadCount(unread);
        setLastFetchTime(now);
        setHasInitialLoad(true);

        // Notify parent component about unread count
        if (onUnreadCountChange) {
          onUnreadCountChange(unread);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        showToast("Failed to load notifications", "error");
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    },
    [onUnreadCountChange, lastFetchTime, hasInitialLoad, showArchived],
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
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)),
    );

    try {
      const response = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notification_id: notificationId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      // Update unread count
      const newUnreadCount = notifications.filter(
        (n) => !n.is_read && n.id !== notificationId && !n.is_archived,
      ).length;
      setUnreadCount(newUnreadCount);
      if (onUnreadCountChange) {
        onUnreadCountChange(newUnreadCount);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      showToast("Failed to mark as read", "error");
      // Revert optimistic update
      fetchNotifications(true);
    }
  };

  const markAllAsRead = async () => {
    // Optimistic update
    const previousNotifications = [...notifications];
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    if (onUnreadCountChange) {
      onUnreadCountChange(0);
    }

    try {
      const response = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mark_all: true }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      showToast(
        result.message || "All notifications marked as read",
        "success",
      );
    } catch (error) {
      console.error("Error marking all as read:", error);
      showToast("Failed to mark all as read", "error");
      // Revert optimistic update
      setNotifications(previousNotifications);
      fetchNotifications(true);
    }
  };

  const archiveNotification = async (notificationId: number) => {
    // Optimistic update
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notification_id: notificationId,
          action: "archive",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      showToast("Notification archived", "success");

      // Update unread count if the archived notification was unread
      const archivedNotif = notifications.find((n) => n.id === notificationId);
      if (archivedNotif && !archivedNotif.is_read) {
        const newUnreadCount = unreadCount - 1;
        setUnreadCount(newUnreadCount);
        if (onUnreadCountChange) {
          onUnreadCountChange(newUnreadCount);
        }
      }
    } catch (error) {
      console.error("Error archiving notification:", error);
      showToast("Failed to archive notification", "error");
      // Revert optimistic update
      fetchNotifications(true);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    // Optimistic update
    const notifToDelete = notifications.find((n) => n.id === notificationId);
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      showToast("Notification deleted", "success");

      // Update unread count if the deleted notification was unread
      if (
        notifToDelete &&
        !notifToDelete.is_read &&
        !notifToDelete.is_archived
      ) {
        const newUnreadCount = unreadCount - 1;
        setUnreadCount(newUnreadCount);
        if (onUnreadCountChange) {
          onUnreadCountChange(newUnreadCount);
        }
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      showToast("Failed to delete notification", "error");
      // Revert optimistic update
      fetchNotifications(true);
    }
  };

  const handleNotificationClick = (notif: Notification) => {
    // Mark as read if unread
    if (!notif.is_read) {
      markAsRead(notif.id);
    }

    // Handle navigation based on type
    if (notif.type === "referred" || notif.type === "rejected") {
      // Navigate to profile applications tab and potentially open modal
      window.location.href = "/profile?tab=applications";
    } else if (notif.type === "application_completed") {
      window.location.href = "/profile?tab=applications";
    } else if (notif.type === "id_verified") {
      window.location.href = "/profile";
    } else if (notif.link) {
      window.location.href = notif.link;
    }

    onClose();
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "referred":
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
              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        );
      case "rejected":
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
              d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        );
      case "id_verified":
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
              d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
            />
          </svg>
        );
      case "application_completed":
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
    <>
      <div className={styles.notificationDropdown}>
        <div className={styles.header}>
          <h3>Notifications</h3>
          <div className={styles.headerActions}>
            {!showArchived && unreadCount > 0 && (
              <button onClick={markAllAsRead} className={styles.markAllBtn}>
                Mark all as read
              </button>
            )}
          </div>
        </div>

        <div className={styles.filterTabs}>
          <button
            className={`${styles.filterTab} ${!showArchived ? styles.active : ""}`}
            onClick={() => {
              setShowArchived(false);
              fetchNotifications(true);
            }}
          >
            Active
            {unreadCount > 0 && (
              <span className={styles.badge}>{unreadCount}</span>
            )}
          </button>
          <button
            className={`${styles.filterTab} ${showArchived ? styles.active : ""}`}
            onClick={() => {
              setShowArchived(true);
              fetchNotifications(true);
            }}
          >
            Archived
          </button>
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
            <p>
              {showArchived
                ? "No archived notifications"
                : "No notifications yet"}
            </p>
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
                  {/* Show company logo for job-related notifications */}
                  {(notif.type === "referred" ||
                    notif.type === "rejected" ||
                    notif.type === "application_completed") &&
                  notif.company_logo ? (
                    <div className={styles.companyLogoWrapper}>
                      <img
                        src={notif.company_logo}
                        alt={notif.company_name || "Company"}
                        className={styles.companyLogo}
                      />
                    </div>
                  ) : (
                    <div className={styles.iconWrapper}>
                      {getNotificationIcon(notif.type)}
                    </div>
                  )}
                  <div className={styles.content}>
                    <h4>{notif.title}</h4>
                    <p>{notif.message}</p>
                    {notif.job_title && (
                      <span className={styles.jobInfo}>
                        {notif.job_title}
                        {notif.company_name && ` · ${notif.company_name}`}
                      </span>
                    )}
                    <span className={styles.time}>
                      {formatTime(notif.created_at)}
                    </span>
                  </div>
                  {!notif.is_read && <div className={styles.unreadDot} />}
                </div>
                <div className={styles.actions}>
                  {!showArchived ? (
                    <>
                      <button
                        className={styles.actionBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          archiveNotification(notif.id);
                        }}
                        aria-label="Archive notification"
                        title="Archive"
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
                            d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                          />
                        </svg>
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        aria-label="Delete notification"
                        title="Delete"
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
                    </>
                  ) : (
                    <button
                      className={styles.deleteBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                      aria-label="Delete notification"
                      title="Delete permanently"
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
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          className={`${styles.toast} ${toast.type === "error" ? styles.toastError : styles.toastSuccess}`}
        >
          {toast.message}
        </div>
      )}
    </>
  );
};

export default NotificationDropdown;

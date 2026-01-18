// Anonymous Chat Service
// Handles chat functionality for unauthenticated users
"use server";

import { createClient } from "@/utils/supabase/server";

export interface AnonymousChatSession {
  id: string;
  anonymous_id: string;
  anonymous_name: string;
  is_anonymous: boolean;
  status: "pending" | "active" | "closed";
  concern?: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  admin_id: number | null;
  last_user_message_at: string | null;
}

export interface AnonymousChatMessage {
  id: number;
  chat_session_id: string;
  sender: "user" | "admin" | "bot";
  message: string;
  created_at: string;
  read_by_user: boolean;
}

// Utility to get current time in ISO format (UTC)
function nowUTC(): string {
  return new Date().toISOString();
}

/**
 * Get active chat session for an anonymous user
 */
export async function getAnonymousActiveSession(
  anonymousId: string
): Promise<AnonymousChatSession | null> {
  if (!anonymousId || anonymousId.trim() === "") {
    throw new Error("Anonymous ID is required");
  }

  const supabase = await createClient();

  // Get the most recent active or pending session for this anonymous user
  const { data: session, error: sessionError } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("is_anonymous", true)
    .eq("anonymous_id", anonymousId)
    .in("status", ["pending", "active"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (sessionError) {
    console.error("Error fetching anonymous active session:", sessionError);
    throw new Error(sessionError.message);
  }

  if (!session) {
    return null;
  }

  // Check if session has timed out (2 minutes of inactivity)
  if (session.last_user_message_at) {
    const lastMessageTime = new Date(session.last_user_message_at);
    const now = new Date();
    const minutesSinceLastMessage =
      (now.getTime() - lastMessageTime.getTime()) / 1000 / 60;

    // Auto-close if more than 2 minutes have passed
    if (minutesSinceLastMessage > 2) {
      console.log("[Anonymous Chat Service] Session timed out:", {
        sessionId: session.id,
        anonymousId: session.anonymous_id,
        minutesSinceLastMessage,
      });

      // Close the session due to timeout
      await supabase
        .from("chat_sessions")
        .update({
          status: "closed",
          closed_at: nowUTC(),
        })
        .eq("id", session.id);

      // Insert timeout message
      await supabase.from("chat_messages").insert({
        chat_session_id: session.id,
        sender: "bot",
        message:
          "This chat has been closed due to inactivity (2 minutes without response).",
      });

      return null;
    }
  }

  return session as AnonymousChatSession;
}

/**
 * Create a new anonymous chat request
 */
export async function createAnonymousChatRequest(
  anonymousId: string,
  concern: string,
  anonymousName?: string
): Promise<AnonymousChatSession> {
  if (!anonymousId || anonymousId.trim() === "") {
    throw new Error("Anonymous ID is required");
  }

  if (!concern || !concern.trim()) {
    throw new Error("Concern message is required");
  }

  const supabase = await createClient();

  // Check if there's already an active session for this anonymous user
  const existingSession = await getAnonymousActiveSession(anonymousId);
  if (existingSession) {
    throw new Error("You already have an active chat session");
  }

  const displayName = anonymousName?.trim() || "Anonymous User";

  // Create chat session
  const { data: chatSession, error: chatError } = await supabase
    .from("chat_sessions")
    .insert({
      is_anonymous: true,
      anonymous_id: anonymousId,
      anonymous_name: displayName,
      status: "pending",
      concern: concern.trim(),
      last_user_message_at: nowUTC(),
    })
    .select()
    .single();

  if (chatError) {
    console.error("Error creating anonymous chat session:", chatError);
    throw new Error(chatError.message);
  }

  // Create initial message from user
  await supabase.from("chat_messages").insert({
    chat_session_id: chatSession.id,
    sender: "user",
    message: concern.trim(),
  });

  return chatSession as AnonymousChatSession;
}

/**
 * Get messages for an anonymous chat session
 */
export async function getAnonymousChatMessages(
  chatSessionId: string,
  anonymousId: string
): Promise<AnonymousChatMessage[]> {
  if (!anonymousId || anonymousId.trim() === "") {
    throw new Error("Anonymous ID is required");
  }

  const supabase = await createClient();

  // Verify the session belongs to this anonymous user
  const { data: session, error: sessionError } = await supabase
    .from("chat_sessions")
    .select("id, anonymous_id, is_anonymous")
    .eq("id", chatSessionId)
    .eq("is_anonymous", true)
    .eq("anonymous_id", anonymousId)
    .single();

  if (sessionError || !session) {
    throw new Error("Chat session not found or access denied");
  }

  // Get messages
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("chat_session_id", chatSessionId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as AnonymousChatMessage[];
}

/**
 * Send a message in an anonymous chat session
 */
export async function sendAnonymousChatMessage(
  chatSessionId: string,
  anonymousId: string,
  message: string
): Promise<AnonymousChatMessage> {
  if (!anonymousId || anonymousId.trim() === "") {
    throw new Error("Anonymous ID is required");
  }

  if (!message || !message.trim()) {
    throw new Error("Message cannot be empty");
  }

  const supabase = await createClient();

  // Verify session exists, belongs to this anonymous user, and is not closed
  const { data: session, error: sessionError } = await supabase
    .from("chat_sessions")
    .select("id, status, anonymous_id, is_anonymous")
    .eq("id", chatSessionId)
    .eq("is_anonymous", true)
    .eq("anonymous_id", anonymousId)
    .single();

  if (sessionError || !session) {
    throw new Error("Chat session not found or access denied");
  }

  if (session.status === "closed") {
    throw new Error("Chat session is closed");
  }

  // Update last_user_message_at timestamp to reset timeout
  await supabase
    .from("chat_sessions")
    .update({ last_user_message_at: nowUTC() })
    .eq("id", chatSessionId);

  // Insert message
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      chat_session_id: chatSessionId,
      sender: "user",
      message: message.trim(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as AnonymousChatMessage;
}

/**
 * Close an anonymous chat session
 */
export async function closeAnonymousChatSession(
  chatSessionId: string,
  anonymousId: string
): Promise<void> {
  if (!anonymousId || anonymousId.trim() === "") {
    throw new Error("Anonymous ID is required");
  }

  const supabase = await createClient();

  // Verify session belongs to this anonymous user
  const { data: session, error: sessionError } = await supabase
    .from("chat_sessions")
    .select("id, status, anonymous_id, is_anonymous")
    .eq("id", chatSessionId)
    .eq("is_anonymous", true)
    .eq("anonymous_id", anonymousId)
    .single();

  if (sessionError || !session) {
    throw new Error("Chat session not found or access denied");
  }

  if (session.status === "closed") {
    throw new Error("Chat session is already closed");
  }

  // Close session
  const { error } = await supabase
    .from("chat_sessions")
    .update({
      status: "closed",
      closed_at: nowUTC(),
    })
    .eq("id", chatSessionId);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Get all chat sessions for an anonymous user
 */
export async function getAnonymousChatSessions(
  anonymousId: string
): Promise<AnonymousChatSession[]> {
  if (!anonymousId || anonymousId.trim() === "") {
    throw new Error("Anonymous ID is required");
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("is_anonymous", true)
    .eq("anonymous_id", anonymousId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as AnonymousChatSession[];
}

/**
 * Mark messages as read for anonymous user
 */
export async function markAnonymousMessagesAsRead(
  chatSessionId: string,
  anonymousId: string
): Promise<void> {
  if (!anonymousId || anonymousId.trim() === "") {
    throw new Error("Anonymous ID is required");
  }

  const supabase = await createClient();

  // Verify session belongs to this anonymous user
  const { data: session } = await supabase
    .from("chat_sessions")
    .select("id")
    .eq("id", chatSessionId)
    .eq("is_anonymous", true)
    .eq("anonymous_id", anonymousId)
    .single();

  if (!session) {
    throw new Error("Chat session not found or access denied");
  }

  const { error } = await supabase
    .from("chat_messages")
    .update({ read_by_user: true })
    .eq("chat_session_id", chatSessionId)
    .eq("sender", "admin")
    .eq("read_by_user", false);

  if (error) {
    console.error("Error marking anonymous messages as read:", error);
  }
}

/**
 * Get unread message count for anonymous user
 */
export async function getAnonymousUnreadCount(
  anonymousId: string
): Promise<number> {
  if (!anonymousId || anonymousId.trim() === "") {
    return 0;
  }

  const supabase = await createClient();

  // Get active session
  const activeSession = await getAnonymousActiveSession(anonymousId);
  if (!activeSession) {
    return 0;
  }

  // Count unread messages from admin
  const { count, error } = await supabase
    .from("chat_messages")
    .select("*", { count: "exact", head: true })
    .eq("chat_session_id", activeSession.id)
    .eq("sender", "admin")
    .eq("read_by_user", false);

  if (error) {
    console.error("Error counting anonymous unread messages:", error);
    return 0;
  }

  return count || 0;
}

/**
 * Generate a unique anonymous ID (UUID v4)
 * This should be called client-side and stored in localStorage
 */
export function generateAnonymousId(): string {
  return `anon-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

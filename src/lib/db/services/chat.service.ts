// Chat service
"use server";

import { getSupabaseClient, getCurrentUser } from "../client";

export interface ChatSession {
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

export interface ChatMessage {
  id: number;
  chat_session_id: string;
  sender: "user" | "admin" | "bot";
  message: string;
  created_at: string;
  read_by_user: boolean;
}

// Utility to convert UTC timestamp to GMT+8
function toGMT8(utcDateString: string): Date {
  const utcDate = new Date(utcDateString);
  // Add 8 hours (28800000 milliseconds)
  return new Date(utcDate.getTime() + 8 * 60 * 60 * 1000);
}

// Utility to get current time in GMT+8
function nowGMT8(): string {
  const now = new Date();
  // Add 8 hours for GMT+8
  const gmt8 = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return gmt8.toISOString();
}

// Get user's active chat session (if any)
export async function getActiveChatSession(): Promise<ChatSession | null> {
  const supabase = await getSupabaseClient();
  const user = await getCurrentUser();

  // Get applicant ID
  const { data: applicant, error: applicantError } = await supabase
    .from("applicants")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (applicantError || !applicant) {
    throw new Error("Applicant not found");
  }

  // Get the most recent active or pending session
  const { data: session, error: sessionError } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("user_id", applicant.id)
    .in("status", ["pending", "active"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (sessionError) {
    console.error("Error fetching active session:", sessionError);
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
      console.log("[Chat Service] Session timed out:", {
        sessionId: session.id,
        minutesSinceLastMessage,
      });

      // Close the session due to timeout
      await supabase
        .from("chat_sessions")
        .update({
          status: "closed",
          closed_at: nowGMT8(),
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

  return session as ChatSession;
}

// Get unread message count for active session
export async function getUnreadMessageCount(): Promise<number> {
  const supabase = await getSupabaseClient();
  const user = await getCurrentUser();

  // Get applicant ID
  const { data: applicant } = await supabase
    .from("applicants")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!applicant) {
    return 0;
  }

  // Get active session
  const activeSession = await getActiveChatSession();
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
    console.error("Error counting unread messages:", error);
    return 0;
  }

  return count || 0;
}

// Mark messages as read when user opens chat
export async function markMessagesAsRead(chatSessionId: string): Promise<void> {
  const supabase = await getSupabaseClient();
  await getCurrentUser();

  const { error } = await supabase
    .from("chat_messages")
    .update({ read_by_user: true })
    .eq("chat_session_id", chatSessionId)
    .eq("sender", "admin")
    .eq("read_by_user", false);

  if (error) {
    console.error("Error marking messages as read:", error);
  }
}

// Create a new chat request
export async function createChatRequest(concern: string): Promise<ChatSession> {
  const supabase = await getSupabaseClient();
  const user = await getCurrentUser();

  // Get applicant ID
  const { data: applicant, error: applicantError } = await supabase
    .from("applicants")
    .select("id, name")
    .eq("auth_id", user.id)
    .single();

  if (applicantError || !applicant) {
    throw new Error("Applicant not found");
  }

  if (!concern || !concern.trim()) {
    throw new Error("Concern message is required");
  }

  // Check if there's already an active session
  const existingSession = await getActiveChatSession();
  if (existingSession) {
    throw new Error("You already have an active chat session");
  }

  // Create chat session
  const { data: chatSession, error: chatError } = await supabase
    .from("chat_sessions")
    .insert({
      user_id: applicant.id,
      status: "pending",
      concern: concern.trim(),
      last_user_message_at: nowGMT8(),
    })
    .select()
    .single();

  if (chatError) {
    throw new Error(chatError.message);
  }

  // Create initial message from user
  await supabase.from("chat_messages").insert({
    chat_session_id: chatSession.id,
    sender: "user",
    message: concern.trim(),
  });

  return chatSession as ChatSession;
}

// Get messages for a chat session
export async function getChatMessages(
  chatSessionId: string,
): Promise<ChatMessage[]> {
  const supabase = await getSupabaseClient();
  await getCurrentUser();

  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("chat_session_id", chatSessionId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  // Convert timestamps to GMT+8
  return (data || []).map((msg) => ({
    ...msg,
    created_at: toGMT8(msg.created_at).toISOString(),
  })) as ChatMessage[];
}

// Send a chat message
export async function sendChatMessage(
  chatSessionId: string,
  message: string,
): Promise<ChatMessage> {
  const supabase = await getSupabaseClient();
  await getCurrentUser();

  if (!message || !message.trim()) {
    throw new Error("Message cannot be empty");
  }

  // Verify session exists and is not closed
  const { data: session, error: sessionError } = await supabase
    .from("chat_sessions")
    .select("id, status")
    .eq("id", chatSessionId)
    .single();

  if (sessionError || !session) {
    throw new Error("Chat session not found");
  }

  if (session.status === "closed") {
    throw new Error("Chat session is closed");
  }

  // Update last_user_message_at timestamp to reset timeout
  await supabase
    .from("chat_sessions")
    .update({ last_user_message_at: nowGMT8() })
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

  // Convert timestamp to GMT+8
  return {
    ...data,
    created_at: toGMT8(data.created_at).toISOString(),
  } as ChatMessage;
}

// Close a chat session
export async function closeChatSession(chatSessionId: string): Promise<void> {
  const supabase = await getSupabaseClient();
  const user = await getCurrentUser();

  // Get applicant ID
  const { data: applicant } = await supabase
    .from("applicants")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!applicant) {
    throw new Error("Applicant not found");
  }

  // Verify session belongs to user
  const { data: session, error: sessionError } = await supabase
    .from("chat_sessions")
    .select("id, status, user_id")
    .eq("id", chatSessionId)
    .single();

  if (sessionError || !session) {
    throw new Error("Chat session not found");
  }

  if (session.user_id !== applicant.id) {
    throw new Error("Not authorized for this chat session");
  }

  if (session.status === "closed") {
    throw new Error("Chat session is already closed");
  }

  // Close session
  const { error } = await supabase
    .from("chat_sessions")
    .update({
      status: "closed",
      closed_at: nowGMT8(),
    })
    .eq("id", chatSessionId);

  if (error) {
    throw new Error(error.message);
  }
}

// Get all chat sessions for current user
export async function getUserChatSessions(): Promise<ChatSession[]> {
  const supabase = await getSupabaseClient();
  const user = await getCurrentUser();

  // Get applicant ID
  const { data: applicant } = await supabase
    .from("applicants")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!applicant) {
    throw new Error("Applicant not found");
  }

  const { data, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("user_id", applicant.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((session) => ({
    ...session,
    created_at: toGMT8(session.created_at).toISOString(),
    updated_at: toGMT8(session.updated_at).toISOString(),
    closed_at: session.closed_at
      ? toGMT8(session.closed_at).toISOString()
      : null,
  })) as ChatSession[];
}

// Get FAQs
export async function getChatFAQs(): Promise<
  {
    id: number;
    question: string;
    answer: string;
    category: string;
    position: number;
  }[]
> {
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase
    .from("chat_faqs")
    .select("*")
    .order("position", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

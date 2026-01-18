// Admin chat service
"use server";

import { getSupabaseClient, getCurrentUser } from "../client";

export interface AdminChatSession {
  id: string;
  userId: number;
  userName: string;
  userEmail: string;
  concern: string;
  timestamp: Date;
  status: "pending" | "active" | "closed";
  adminId: number | null;
  closedAt: Date | null;
}

export interface ChatMessage {
  id: number;
  chat_session_id: string;
  sender: "user" | "admin" | "bot";
  message: string;
  created_at: string;
}

// Utility to parse UTC timestamp to Date object (browser will handle timezone conversion)
function parseUTCDate(utcDateString: string): Date {
  return new Date(utcDateString);
}

// Utility to get current time in ISO format (UTC)
function nowUTC(): string {
  return new Date().toISOString();
}

// Get admin profile
async function getAdminProfile() {
  const supabase = await getSupabaseClient();
  const user = await getCurrentUser();

  const { data: adminData, error: adminError } = await supabase
    .from("peso")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (adminError || !adminData) {
    throw new Error("Unauthorized: Admin access required");
  }

  return adminData;
}

// Get chat sessions by status
export async function getAdminChatSessions(
  status: "pending" | "active" | "closed",
): Promise<AdminChatSession[]> {
  const supabase = await getSupabaseClient();
  await getAdminProfile(); // Verify admin access

  // Query chat sessions and join with applicants table
  const { data: chatSessions, error: sessionsError } = await supabase
    .from("chat_sessions")
    .select(
      `
      id,
      user_id,
      admin_id,
      status,
      concern,
      created_at,
      closed_at,
      applicants!inner(
        name,
        phone
      )
    `,
    )
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (sessionsError) {
    console.error("Error fetching chat sessions:", sessionsError);
    throw new Error(sessionsError.message);
  }

  // Format timestamps (keep as Date objects, browser will handle timezone)
  const formattedSessions: AdminChatSession[] = (chatSessions || []).map(
    (session: {
      id: string;
      user_id: number;
      admin_id: number | null;
      status: string;
      concern: string | null;
      created_at: string;
      closed_at: string | null;
      applicants: { name: string; phone: string | null }[];
    }) => {
      const applicant = Array.isArray(session.applicants)
        ? session.applicants[0]
        : session.applicants;
      const userName = applicant?.name || "Unknown User";

      return {
        id: session.id,
        userId: session.user_id,
        userName: userName,
        userEmail: applicant?.phone || "No contact",
        concern: session.concern || "",
        timestamp: parseUTCDate(session.created_at), // Parse UTC, browser handles timezone
        status: session.status as "pending" | "active" | "closed",
        adminId: session.admin_id,
        closedAt: session.closed_at ? parseUTCDate(session.closed_at) : null, // Parse UTC
      };
    },
  );

  return formattedSessions;
}

// Accept/join a chat session
export async function acceptChatSession(
  chatId: string,
): Promise<{ success: boolean; isJoiningBotSession: boolean }> {
  const supabase = await getSupabaseClient();
  const adminData = await getAdminProfile();

  // Verify chat session exists and is available
  const { data: chatSession, error: sessionError } = await supabase
    .from("chat_sessions")
    .select("id, status")
    .eq("id", chatId)
    .single();

  if (sessionError || !chatSession) {
    throw new Error("Chat session not found");
  }

  if (chatSession.status !== "pending" && chatSession.status !== "active") {
    throw new Error("Chat session is not available");
  }

  const isJoiningBotSession = chatSession.status === "active";

  // Update chat session to active and assign admin
  const { error: updateError } = await supabase
    .from("chat_sessions")
    .update({
      status: "active",
      admin_id: adminData.id,
    })
    .eq("id", chatId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  // Send a message to notify user that admin has joined
  if (isJoiningBotSession) {
    await supabase.from("chat_messages").insert({
      chat_session_id: chatId,
      sender: "admin",
      message: "An admin has joined the chat. How can I help you?",
    });
  }

  return { success: true, isJoiningBotSession };
}

// Get messages for a chat session
export async function getChatSessionMessages(
  chatId: string,
): Promise<ChatMessage[]> {
  const supabase = await getSupabaseClient();
  await getAdminProfile(); // Verify admin access

  // Verify chat session exists
  const { data: chatSession, error: sessionError } = await supabase
    .from("chat_sessions")
    .select("id, status, admin_id")
    .eq("id", chatId)
    .single();

  if (sessionError || !chatSession) {
    throw new Error("Chat session not found");
  }

  // Get messages
  const { data: messages, error: messagesError } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("chat_session_id", chatId)
    .order("created_at", { ascending: true });

  if (messagesError) {
    throw new Error(messagesError.message);
  }

  // Return messages with UTC timestamps (browser will handle timezone conversion)
  return messages || [];
}

// Send a message as admin
export async function sendAdminMessage(
  chatId: string,
  message: string,
): Promise<ChatMessage> {
  const supabase = await getSupabaseClient();
  const adminData = await getAdminProfile();

  if (!message || !message.trim()) {
    throw new Error("Message cannot be empty");
  }

  // Verify chat session exists and admin is assigned
  const { data: chatSession, error: sessionError } = await supabase
    .from("chat_sessions")
    .select("id, status, admin_id")
    .eq("id", chatId)
    .single();

  if (sessionError || !chatSession) {
    throw new Error("Chat session not found");
  }

  if (chatSession.status === "closed") {
    throw new Error("Chat session is closed");
  }

  if (chatSession.admin_id !== adminData.id) {
    throw new Error("Not authorized for this chat session");
  }

  // Insert message
  const { data: newMessage, error: messageError } = await supabase
    .from("chat_messages")
    .insert({
      chat_session_id: chatId,
      sender: "admin",
      message: message.trim(),
    })
    .select()
    .single();

  if (messageError) {
    throw new Error(messageError.message);
  }

  // Return message with UTC timestamp (browser will handle timezone conversion)
  return newMessage;
}

// Close a chat session
// Close a chat session
export async function closeChatSession(chatId: string): Promise<void> {
  const supabase = await getSupabaseClient();
  await getAdminProfile(); // Verify admin access (any admin can close)

  // Verify chat session exists
  const { data: chatSession, error: sessionError } = await supabase
    .from("chat_sessions")
    .select("id, status")
    .eq("id", chatId)
    .single();

  if (sessionError || !chatSession) {
    throw new Error("Chat session not found");
  }

  if (chatSession.status === "closed") {
    throw new Error("Chat session is already closed");
  }

  // Any admin can close a chat - removed admin_id check ✅
  // This allows for better collaboration and handoffs

  // Update chat session to closed with UTC timestamp
  const { error: updateError } = await supabase
    .from("chat_sessions")
    .update({
      status: "closed",
      closed_at: nowUTC(), // Use UTC timestamp
    })
    .eq("id", chatId);

  if (updateError) {
    throw new Error(updateError.message);
  }
}

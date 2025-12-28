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

  // Use the database function that joins with applicants table
  const { data: chatSessions, error: sessionsError } = await supabase.rpc(
    "get_chat_sessions_for_admin",
    { session_status: status },
  );

  if (sessionsError) {
    console.error("Error fetching chat sessions:", sessionsError);
    throw new Error(sessionsError.message);
  }

  // Format and convert timestamps to GMT+8
  const formattedSessions: AdminChatSession[] = (chatSessions || []).map(
    (session: {
      id: string;
      user_id: number;
      admin_id: number | null;
      status: string;
      concern: string | null;
      created_at: string;
      closed_at: string | null;
      applicant_name: string | null;
      applicant_email: string | null;
    }) => ({
      id: session.id,
      userId: session.user_id,
      userName: session.applicant_name || "Unknown User",
      userEmail: session.applicant_email || "No email",
      concern: session.concern || "",
      timestamp: toGMT8(session.created_at), // Convert to GMT+8
      status: session.status as "pending" | "active" | "closed",
      adminId: session.admin_id,
      closedAt: session.closed_at ? toGMT8(session.closed_at) : null, // Convert to GMT+8
    }),
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

  // Convert timestamps to GMT+8
  return (messages || []).map((msg) => ({
    ...msg,
    created_at: toGMT8(msg.created_at).toISOString(),
  }));
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

  // Convert timestamp to GMT+8
  return {
    ...newMessage,
    created_at: toGMT8(newMessage.created_at).toISOString(),
  };
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

  // Update chat session to closed with GMT+8 timestamp
  const { error: updateError } = await supabase
    .from("chat_sessions")
    .update({
      status: "closed",
      closed_at: nowGMT8(), // Use GMT+8 timestamp
    })
    .eq("id", chatId);

  if (updateError) {
    throw new Error(updateError.message);
  }
}

// Chat service
"use server";

import { getSupabaseClient, getCurrentUser } from "../client";

export interface ChatSession {
  id: number;
  user_id: number;
  status: "pending" | "active" | "closed";
  concern?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: number;
  chat_session_id: number;
  sender: "user" | "admin";
  message: string;
  created_at: string;
}

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

  // Create chat session
  const { data: chatSession, error: chatError } = await supabase
    .from("chat_sessions")
    .insert({
      user_id: applicant.id,
      status: "pending",
      concern: concern.trim(),
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

export async function getChatMessages(
  chatSessionId: number,
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

  return data as ChatMessage[];
}

export async function sendChatMessage(
  chatSessionId: number,
  message: string,
): Promise<ChatMessage> {
  const supabase = await getSupabaseClient();
  await getCurrentUser();

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

  return data as ChatMessage;
}

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

  return data as ChatSession[];
}

export async function closeChatSession(chatSessionId: number): Promise<void> {
  const supabase = await getSupabaseClient();
  await getCurrentUser();

  const { error } = await supabase
    .from("chat_sessions")
    .update({ status: "closed" })
    .eq("id", chatSessionId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getChatFAQs(): Promise<
  {
    id: number;
    question: string;
    answer: string;
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

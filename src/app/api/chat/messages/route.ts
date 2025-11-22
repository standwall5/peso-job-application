import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET messages for user's active chat session
export async function GET() {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Get applicant ID from auth_id
  const { data: applicantData, error: applicantError } = await supabase
    .from("applicants")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (applicantError || !applicantData) {
    console.error("Applicant lookup error:", applicantError);
    return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
  }

  // Get user's active chat session
  const { data: chatSession, error: sessionError } = await supabase
    .from("chat_sessions")
    .select("id")
    .eq("user_id", applicantData.id)
    .in("status", ["pending", "active"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (sessionError || !chatSession) {
    return NextResponse.json({ messages: [], sessionId: null });
  }

  // Get messages for this session
  const { data: messages, error: messagesError } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("chat_session_id", chatSession.id)
    .order("created_at", { ascending: true });

  if (messagesError) {
    console.error("Fetch messages error:", messagesError);
    return NextResponse.json({ error: messagesError.message }, { status: 500 });
  }

  return NextResponse.json({ messages: messages || [], sessionId: chatSession.id });
}

// POST a new message from user
export async function POST(request: Request) {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { message, sessionId } = body;

  if (!message || !message.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  // Get applicant ID from auth_id
  const { data: applicantData, error: applicantError } = await supabase
    .from("applicants")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (applicantError || !applicantData) {
    console.error("Applicant lookup error:", applicantError);
    return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
  }

  // Verify session belongs to user
  const { data: chatSession, error: sessionError } = await supabase
    .from("chat_sessions")
    .select("id, status")
    .eq("id", sessionId)
    .eq("user_id", applicantData.id)
    .single();

  if (sessionError || !chatSession) {
    console.error("Chat session verification error:", sessionError);
    return NextResponse.json({ error: "Chat session not found" }, { status: 404 });
  }

  if (chatSession.status === "closed") {
    return NextResponse.json({ error: "Chat session is closed" }, { status: 400 });
  }

  // Insert message
  const { data: newMessage, error: messageError } = await supabase
    .from("chat_messages")
    .insert({
      chat_session_id: sessionId,
      sender: "user",
      message: message.trim(),
    })
    .select()
    .single();

  if (messageError) {
    console.error("Insert message error:", messageError);
    return NextResponse.json({ error: messageError.message }, { status: 500 });
  }

  return NextResponse.json(newMessage);
}

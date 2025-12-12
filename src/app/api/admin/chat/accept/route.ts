import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Verify user is admin and get admin ID
  const { data: adminData, error: adminError } = await supabase
    .from("peso")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (adminError || !adminData) {
    console.error("Admin lookup error:", adminError);
    return NextResponse.json(
      { error: "Unauthorized - Admin access required" },
      { status: 403 },
    );
  }

  const body = await request.json();
  const { chatId } = body;

  if (!chatId) {
    return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
  }

  // Verify chat session exists and is pending
  const { data: chatSession, error: sessionError } = await supabase
    .from("chat_sessions")
    .select("id, status")
    .eq("id", chatId)
    .single();

  if (sessionError || !chatSession) {
    console.error("Chat session lookup error:", sessionError);
    return NextResponse.json(
      { error: "Chat session not found" },
      { status: 404 },
    );
  }

  if (chatSession.status !== "pending" && chatSession.status !== "active") {
    return NextResponse.json(
      { error: "Chat session is not available" },
      { status: 400 },
    );
  }

  // If already active (bot session), admin is joining; if pending, admin is accepting
  const isJoiningBotSession = chatSession.status === "active";

  // Update chat session to active and assign admin
  const { data: updatedSession, error: updateError } = await supabase
    .from("chat_sessions")
    .update({
      status: "active",
      admin_id: adminData.id,
    })
    .eq("id", chatId)
    .select()
    .single();

  if (updateError) {
    console.error("Update chat session error:", updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Send a message to notify user that admin has joined
  if (isJoiningBotSession) {
    await supabase.from("chat_messages").insert({
      chat_session_id: chatId,
      sender: "admin",
      message: "An admin has joined the chat. How can I help you?",
    });
  }

  return NextResponse.json(updatedSession);
}

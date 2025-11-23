import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// POST a new message from admin
export async function POST(request: Request) {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Verify user is admin
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
  const { chatId, message } = body;

  console.log("[Admin Messages API] Sending message:", {
    chatId,
    messageLength: message?.length,
    adminId: adminData.id,
  });

  if (!chatId || !message || !message.trim()) {
    return NextResponse.json(
      { error: "Chat ID and message are required" },
      { status: 400 },
    );
  }

  // Verify chat session exists and admin is assigned
  const { data: chatSession, error: sessionError } = await supabase
    .from("chat_sessions")
    .select("id, status, admin_id")
    .eq("id", chatId)
    .single();

  if (sessionError || !chatSession) {
    console.error("Chat session lookup error:", sessionError);
    return NextResponse.json(
      { error: "Chat session not found" },
      { status: 404 },
    );
  }

  if (chatSession.status === "closed") {
    return NextResponse.json(
      { error: "Chat session is closed" },
      { status: 400 },
    );
  }

  if (chatSession.admin_id !== adminData.id) {
    return NextResponse.json(
      { error: "Not authorized for this chat session" },
      { status: 403 },
    );
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
    console.error("Insert message error:", messageError);
    return NextResponse.json({ error: messageError.message }, { status: 500 });
  }

  console.log("[Admin Messages API] Message sent successfully:", {
    messageId: newMessage.id,
    chatId: newMessage.chat_session_id,
    sender: newMessage.sender,
  });

  return NextResponse.json(newMessage);
}

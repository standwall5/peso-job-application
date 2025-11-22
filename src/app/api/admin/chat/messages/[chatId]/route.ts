import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ chatId: string }> },
) {
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

  const { chatId } = await params;

  if (!chatId) {
    return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
  }

  // Verify chat session exists
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

  // Get messages for this session
  const { data: messages, error: messagesError } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("chat_session_id", chatId)
    .order("created_at", { ascending: true });

  if (messagesError) {
    console.error("Fetch messages error:", messagesError);
    return NextResponse.json({ error: messagesError.message }, { status: 500 });
  }

  return NextResponse.json(messages || []);
}

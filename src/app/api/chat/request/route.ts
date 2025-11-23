import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { isAdminAvailable, getBotGreeting } from "@/utils/chatbot";

export async function POST(request: Request) {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Get request body
  const body = await request.json();
  const { concern } = body;

  if (!concern || !concern.trim()) {
    return NextResponse.json(
      { error: "Concern message is required" },
      { status: 400 },
    );
  }

  // Get applicant ID from auth_id
  const { data: applicantData, error: applicantError } = await supabase
    .from("applicants")
    .select("id, name")
    .eq("auth_id", user.id)
    .single();

  if (applicantError || !applicantData) {
    console.error("Applicant lookup error:", applicantError);
    return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
  }

  // Check if admins are available
  const adminAvailable = isAdminAvailable();
  const initialStatus = adminAvailable ? "pending" : "active";

  console.log("[Chat Request] Creating session:", {
    userId: applicantData.id,
    userName: applicantData.name,
    authId: user.id,
    adminAvailable,
    initialStatus,
    willSendBotGreeting: !adminAvailable,
    timestamp: new Date().toISOString(),
  });

  // Create chat session with concern
  const { data: chatSession, error: chatError } = await supabase
    .from("chat_sessions")
    .insert({
      user_id: applicantData.id,
      status: initialStatus,
      concern: concern.trim(),
    })
    .select()
    .single();

  if (chatError) {
    console.error("Create chat session error:", chatError);
    return NextResponse.json({ error: chatError.message }, { status: 500 });
  }

  console.log("[Chat Request] Session created successfully:", {
    sessionId: chatSession.id,
    status: chatSession.status,
    userId: chatSession.user_id,
    concern: chatSession.concern?.substring(0, 50),
    timestamp: new Date().toISOString(),
  });

  // Create initial message from user with their concern
  const { error: messageError } = await supabase.from("chat_messages").insert({
    chat_session_id: chatSession.id,
    sender: "user",
    message: concern.trim(),
  });

  if (messageError) {
    console.error("Create initial message error:", messageError);
    // Don't fail the request, session is already created
  }

  // If no admin available, send bot greeting and initial response
  if (!adminAvailable) {
    const botGreeting = getBotGreeting();

    // Insert bot greeting message with buttons (stored as JSON in message field)
    const greetingMessage =
      botGreeting.message +
      (botGreeting.buttons
        ? "\n\n[BUTTONS]" + JSON.stringify(botGreeting.buttons)
        : "");

    await supabase.from("chat_messages").insert({
      chat_session_id: chatSession.id,
      sender: "admin",
      message: greetingMessage,
    });
  }

  console.log("[Chat Request] Returning response:", {
    sessionId: chatSession.id,
    finalStatus: chatSession.status,
    hadBotGreeting: !adminAvailable,
  });

  return NextResponse.json(chatSession);
}

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { isAdminAvailable, getBotGreeting } from "@/utils/chatbot";

export async function POST(request: Request) {
  const supabase = await createClient();

  // Get request body
  const body = await request.json();
  const { concern, anonymousId, anonymousName } = body;

  if (!concern || !concern.trim()) {
    return NextResponse.json(
      { error: "Concern message is required" },
      { status: 400 },
    );
  }

  // Get authenticated user (may be null for anonymous users)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAnonymous = false;
  let userId: number | null = null;
  let userName = "User";

  if (user) {
    // Authenticated user
    const { data: applicantData, error: applicantError } = await supabase
      .from("applicants")
      .select("id, name")
      .eq("auth_id", user.id)
      .single();

    if (applicantError || !applicantData) {
      console.error("Applicant lookup error:", applicantError);
      return NextResponse.json(
        { error: "Applicant not found" },
        { status: 404 },
      );
    }

    userId = applicantData.id;
    userName = applicantData.name;
  } else {
    // Anonymous user
    if (!anonymousId || !anonymousId.trim()) {
      return NextResponse.json(
        { error: "Anonymous ID is required for unauthenticated users" },
        { status: 400 },
      );
    }
    isAnonymous = true;
    userName = anonymousName?.trim() || "Anonymous User";
  }

  // Check if admins are available
  const adminAvailable = isAdminAvailable();
  const initialStatus = adminAvailable ? "pending" : "active";

  console.log("[Chat Request] Creating session:", {
    isAnonymous,
    userId,
    anonymousId: isAnonymous ? anonymousId : null,
    userName,
    adminAvailable,
    initialStatus,
    willSendBotGreeting: !adminAvailable,
    timestamp: new Date().toISOString(),
  });

  // Create chat session with concern
  const sessionData: any = {
    status: initialStatus,
    concern: concern.trim(),
    last_user_message_at: new Date().toISOString(),
  };

  if (isAnonymous) {
    sessionData.is_anonymous = true;
    sessionData.anonymous_id = anonymousId.trim();
    sessionData.anonymous_name = userName;
  } else {
    sessionData.user_id = userId;
    sessionData.is_anonymous = false;
  }

  const { data: chatSession, error: chatError } = await supabase
    .from("chat_sessions")
    .insert(sessionData)
    .select()
    .single();

  if (chatError) {
    console.error("Create chat session error:", chatError);
    return NextResponse.json({ error: chatError.message }, { status: 500 });
  }

  console.log("[Chat Request] Session created successfully:", {
    sessionId: chatSession.id,
    status: chatSession.status,
    isAnonymous: chatSession.is_anonymous,
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

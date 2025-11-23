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

  const body = await request.json();
  const { sessionId } = body;

  if (!sessionId) {
    return NextResponse.json(
      { error: "Session ID is required" },
      { status: 400 },
    );
  }

  // Verify chat session exists and belongs to user
  const { data: chatSession, error: sessionError } = await supabase
    .from("chat_sessions")
    .select("id, status, user_id")
    .eq("id", sessionId)
    .single();

  if (sessionError || !chatSession) {
    console.error("Chat session lookup error:", sessionError);
    return NextResponse.json(
      { error: "Chat session not found" },
      { status: 404 },
    );
  }

  if (chatSession.user_id !== applicantData.id) {
    return NextResponse.json(
      { error: "Not authorized for this chat session" },
      { status: 403 },
    );
  }

  if (chatSession.status === "closed") {
    return NextResponse.json(
      { error: "Chat session is already closed" },
      { status: 400 },
    );
  }

  console.log("[Chat Close] User closing chat:", {
    sessionId,
    userId: applicantData.id,
    previousStatus: chatSession.status,
  });

  // Close chat session
  const { data: updatedSession, error: updateError } = await supabase
    .from("chat_sessions")
    .update({
      status: "closed",
      closed_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .select()
    .single();

  if (updateError) {
    console.error("Update chat session error:", updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  console.log("[Chat Close] Chat closed successfully:", {
    sessionId: updatedSession.id,
    status: updatedSession.status,
    closedAt: updatedSession.closed_at,
  });

  return NextResponse.json({
    success: true,
    session: updatedSession,
  });
}

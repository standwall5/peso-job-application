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
    .select("id, first_name, last_name, email")
    .eq("auth_id", user.id)
    .single();

  if (applicantError || !applicantData) {
    console.error("Applicant lookup error:", applicantError);
    return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
  }

  // Create chat session with concern
  const { data: chatSession, error: chatError } = await supabase
    .from("chat_sessions")
    .insert({
      user_id: applicantData.id,
      status: "pending",
      concern: concern.trim(),
    })
    .select()
    .single();

  if (chatError) {
    console.error("Create chat session error:", chatError);
    return NextResponse.json({ error: chatError.message }, { status: 500 });
  }

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

  return NextResponse.json(chatSession);
}

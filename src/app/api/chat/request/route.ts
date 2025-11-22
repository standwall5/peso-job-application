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

  // Create chat session
  const { data: chatSession, error: chatError } = await supabase
    .from("chat_sessions")
    .insert({
      user_id: applicantData.id,
      status: "pending",
    })
    .select()
    .single();

  if (chatError) {
    console.error("Create chat session error:", chatError);
    return NextResponse.json({ error: chatError.message }, { status: 500 });
  }

  return NextResponse.json(chatSession);
}

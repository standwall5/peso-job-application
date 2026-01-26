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

  try {
    const body = await request.json();
    const { applicantId, initialMessage } = body;

    if (!applicantId) {
      return NextResponse.json(
        { error: "Applicant ID is required" },
        { status: 400 },
      );
    }

    // Get applicant details
    const { data: applicant, error: applicantError } = await supabase
      .from("applicants")
      .select("id, name, phone")
      .eq("id", applicantId)
      .single();

    if (applicantError || !applicant) {
      return NextResponse.json(
        { error: "Applicant not found" },
        { status: 404 },
      );
    }

    // Check if there's already an active or pending session with this applicant
    const { data: existingSession } = await supabase
      .from("chat_sessions")
      .select("id, status")
      .eq("user_id", applicantId)
      .in("status", ["pending", "active"])
      .single();

    // If session exists, return it
    if (existingSession) {
      return NextResponse.json({
        sessionId: existingSession.id,
        status: existingSession.status,
        message: "Chat session already exists",
        existing: true,
      });
    }

    // Create new chat session initiated by admin
    const { data: chatSession, error: chatError } = await supabase
      .from("chat_sessions")
      .insert({
        user_id: applicantId,
        admin_id: adminData.id,
        status: "active", // Auto-accept since admin initiated
        concern: initialMessage || "Admin initiated chat",
      })
      .select()
      .single();

    if (chatError) {
      console.error("Error creating chat session:", chatError);
      return NextResponse.json(
        { error: "Failed to create chat session" },
        { status: 500 },
      );
    }

    // Create initial message from admin if provided
    if (initialMessage) {
      const { error: messageError } = await supabase
        .from("chat_messages")
        .insert({
          chat_session_id: chatSession.id,
          sender: "admin",
          message: initialMessage,
          read_by_user: false, // User should see notification
        });

      if (messageError) {
        console.error("Error creating initial message:", messageError);
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({
      sessionId: chatSession.id,
      status: "active",
      message: "Chat session created successfully",
      existing: false,
    });
  } catch (error) {
    console.error("Error initiating chat:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

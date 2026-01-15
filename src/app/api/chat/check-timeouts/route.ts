import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    // Calculate the cutoff time (2 minutes ago)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

    console.log("[Chat Timeout Check] Starting timeout check...", {
      cutoffTime: twoMinutesAgo.toISOString(),
    });

    // Find active or pending sessions where last_user_message_at is older than 2 minutes
    const { data: expiredSessions, error: fetchError } = await supabase
      .from("chat_sessions")
      .select("id, user_id, last_user_message_at, status")
      .in("status", ["pending", "active"])
      .not("last_user_message_at", "is", null)
      .lt("last_user_message_at", twoMinutesAgo.toISOString());

    if (fetchError) {
      console.error("[Chat Timeout Check] Error fetching sessions:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!expiredSessions || expiredSessions.length === 0) {
      console.log("[Chat Timeout Check] No expired sessions found");
      return NextResponse.json({
        success: true,
        closedCount: 0,
        message: "No expired sessions",
      });
    }

    console.log(
      `[Chat Timeout Check] Found ${expiredSessions.length} expired session(s)`,
      expiredSessions.map((s) => ({
        id: s.id,
        status: s.status,
        lastMessage: s.last_user_message_at,
      }))
    );

    // Close all expired sessions
    const sessionIds = expiredSessions.map((s) => s.id);
    const { error: updateError } = await supabase
      .from("chat_sessions")
      .update({
        status: "closed",
        closed_at: new Date().toISOString(),
      })
      .in("id", sessionIds);

    if (updateError) {
      console.error("[Chat Timeout Check] Error closing sessions:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Add timeout messages to each session
    for (const session of expiredSessions) {
      await supabase.from("chat_messages").insert({
        chat_session_id: session.id,
        sender: "bot",
        message:
          "This chat has been closed due to inactivity (2 minutes without response).",
      });
    }

    console.log(
      `[Chat Timeout Check] Successfully closed ${sessionIds.length} session(s)`
    );

    return NextResponse.json({
      success: true,
      closedCount: sessionIds.length,
      sessionIds,
    });
  } catch (error) {
    console.error("[Chat Timeout Check] Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Allow GET requests as well for easier manual testing
export async function GET() {
  return POST(new Request("http://localhost"));
}

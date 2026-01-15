import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// This endpoint should be called by a cron job (e.g., every minute)
// You can use Vercel Cron Jobs or external services like cron-job.org

export async function GET(request: Request) {
  try {
    // Verify authorization (optional but recommended)
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.CRON_SECRET;

    // If CRON_SECRET is set, verify it
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Cron] Starting chat timeout check...");

    const supabase = await createClient();

    // Calculate the cutoff time (2 minutes ago)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

    // Find active or pending sessions where last_user_message_at is older than 2 minutes
    const { data: expiredSessions, error: fetchError } = await supabase
      .from("chat_sessions")
      .select("id, user_id, last_user_message_at, status")
      .in("status", ["pending", "active"])
      .not("last_user_message_at", "is", null)
      .lt("last_user_message_at", twoMinutesAgo.toISOString());

    if (fetchError) {
      console.error("[Cron] Error fetching expired sessions:", fetchError);
      return NextResponse.json(
        {
          success: false,
          error: fetchError.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    if (!expiredSessions || expiredSessions.length === 0) {
      console.log("[Cron] No expired chat sessions found");
      return NextResponse.json({
        success: true,
        closedCount: 0,
        message: "No expired sessions",
        timestamp: new Date().toISOString(),
      });
    }

    console.log(
      `[Cron] Found ${expiredSessions.length} expired session(s)`,
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
      console.error("[Cron] Error closing sessions:", updateError);
      return NextResponse.json(
        {
          success: false,
          error: updateError.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // Add timeout messages to each session
    const messageInserts = expiredSessions.map((session) => ({
      chat_session_id: session.id,
      sender: "bot",
      message:
        "This chat has been closed due to inactivity (2 minutes without response).",
    }));

    const { error: messageError } = await supabase
      .from("chat_messages")
      .insert(messageInserts);

    if (messageError) {
      console.error("[Cron] Error adding timeout messages:", messageError);
      // Don't fail the whole operation if messages fail to insert
    }

    console.log(
      `[Cron] Successfully closed ${sessionIds.length} expired session(s)`
    );

    return NextResponse.json({
      success: true,
      closedCount: sessionIds.length,
      sessionIds,
      message: `Successfully closed ${sessionIds.length} expired chat session(s)`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] Chat timeout check failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggering
export async function POST(request: Request) {
  return GET(request);
}

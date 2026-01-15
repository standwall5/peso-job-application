import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// This should match the secret you set in cron-job.org
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from cron-job.org
    const authHeader = request.headers.get("authorization");
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create Supabase admin client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role for admin access
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get chat sessions that have been inactive for 5+ minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data: inactiveSessions, error: fetchError } = await supabase
      .from("chat_sessions")
      .select("id, last_user_message_at, updated_at")
      .eq("status", "active")
      .or(
        `last_user_message_at.lt.${fiveMinutesAgo},and(last_user_message_at.is.null,updated_at.lt.${fiveMinutesAgo})`
      );

    if (fetchError) {
      console.error("Error fetching inactive sessions:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch sessions", details: fetchError.message },
        { status: 500 }
      );
    }

    if (!inactiveSessions || inactiveSessions.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No inactive sessions to close",
        closedCount: 0,
      });
    }

    // Close inactive sessions
    const sessionIds = inactiveSessions.map((s) => s.id);

    const { error: updateError } = await supabase
      .from("chat_sessions")
      .update({
        status: "closed",
        closed_at: new Date().toISOString(),
      })
      .in("id", sessionIds);

    if (updateError) {
      console.error("Error closing sessions:", updateError);
      return NextResponse.json(
        { error: "Failed to close sessions", details: updateError.message },
        { status: 500 }
      );
    }

    console.log(`Closed ${sessionIds.length} inactive chat sessions`);

    return NextResponse.json({
      success: true,
      message: `Successfully closed ${sessionIds.length} inactive sessions`,
      closedCount: sessionIds.length,
      sessionIds,
    });
  } catch (error) {
    console.error("Chat timeout cron error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Allow POST as well in case cron-job.org sends POST
export async function POST(request: NextRequest) {
  return GET(request);
}

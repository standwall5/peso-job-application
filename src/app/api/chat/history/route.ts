import { NextResponse } from "next/server";
import { getUserChatSessions } from "@/lib/db/services/chat.service";

export async function GET() {
  try {
    const sessions = await getUserChatSessions();

    // Filter to only closed sessions for history
    const closedSessions = sessions.filter(
      (session) => session.status === "closed"
    );

    return NextResponse.json({
      success: true,
      sessions: closedSessions,
    });
  } catch (error) {
    console.error("[API] Error getting chat history:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get chat history",
      },
      { status: 500 }
    );
  }
}

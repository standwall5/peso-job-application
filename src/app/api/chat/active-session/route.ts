import { NextResponse } from "next/server";
import { getActiveChatSession } from "@/lib/db/services/chat.service";

export async function GET() {
  try {
    const session = await getActiveChatSession();

    if (session) {
      return NextResponse.json({
        success: true,
        session,
      });
    } else {
      return NextResponse.json({
        success: true,
        session: null,
      });
    }
  } catch (error) {
    console.error("[API] Error getting active session:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get active session",
      },
      { status: 500 }
    );
  }
}

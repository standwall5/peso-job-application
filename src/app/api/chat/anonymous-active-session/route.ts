import { NextResponse } from "next/server";
import { getAnonymousActiveSession } from "@/lib/db/services/anonymous-chat.service";

export async function GET(request: Request) {
  try {
    // Get anonymous ID from query parameters
    const { searchParams } = new URL(request.url);
    const anonymousId = searchParams.get("anonymousId");

    if (!anonymousId) {
      return NextResponse.json(
        { error: "Anonymous ID is required" },
        { status: 400 }
      );
    }

    // Get active session for this anonymous user
    const session = await getAnonymousActiveSession(anonymousId);

    if (!session) {
      return NextResponse.json({ session: null });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("Error getting anonymous active session:", error);
    return NextResponse.json(
      { error: "Failed to get active session" },
      { status: 500 }
    );
  }
}

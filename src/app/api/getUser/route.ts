import { NextResponse } from "next/server";
import { getUser } from "@/lib/db/services/user.service";

export async function GET() {
  try {
    const user = await getUser();
    return NextResponse.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch user data",
      },
      { status: 500 },
    );
  }
}

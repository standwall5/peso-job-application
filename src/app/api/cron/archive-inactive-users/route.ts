import { NextResponse } from "next/server";
import { autoArchiveInactiveUsers } from "@/lib/db/services/user-archive.service";

// This endpoint should be called by a cron job (e.g., daily or weekly)
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

    console.log("[Cron] Starting auto-archive job...");

    // Archive users inactive for 30 days (1 month)
    // Adjusted from 180 days to meet new business requirements
    const INACTIVE_DAYS = 30;

    const result = await autoArchiveInactiveUsers(INACTIVE_DAYS);

    console.log(
      `[Cron] Auto-archive completed. Archived: ${result.archived}, Errors: ${result.errors.length}`,
    );

    return NextResponse.json({
      success: true,
      archived: result.archived,
      errors: result.errors,
      message: `Successfully archived ${result.archived} inactive users`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] Auto-archive job failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

// Also support POST for manual triggering
export async function POST(request: Request) {
  return GET(request);
}

import { NextRequest, NextResponse } from "next/server";
import { getAllJobseekers } from "@/lib/db/services/application.service";

export async function GET(req: NextRequest) {
  try {
    // Get archived filter from query params (default to false = only non-archived)
    const searchParams = req.nextUrl.searchParams;
    const archived = searchParams.get("archived");
    const isArchived = archived === "true";

    // Fetch all jobseekers using the optimized service function
    const jobseekers = await getAllJobseekers(isArchived);

    return NextResponse.json(jobseekers);
  } catch (error) {
    console.error("Error fetching jobseekers:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch jobseekers",
      },
      { status: 500 },
    );
  }
}

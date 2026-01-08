import { NextResponse } from "next/server";
import { getJobs } from "@/lib/db/services/job.service";

export async function GET() {
  try {
    const jobs = await getJobs();
    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Fetch jobs error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch jobs",
      },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import {
  getApplicationProgressForJob,
  getAllApplicationProgress,
  upsertApplicationProgress,
  deleteApplicationProgress,
} from "@/lib/db/services/application.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (jobId) {
      // Get progress for specific job
      const progress = await getApplicationProgressForJob(Number(jobId));
      return NextResponse.json({ progress: progress || null });
    } else {
      // Get all progress for this applicant
      const progress = await getAllApplicationProgress();
      return NextResponse.json({ progress: progress || [] });
    }
  } catch (error) {
    console.error("Application progress fetch error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch application progress",
      },
      {
        status:
          error instanceof Error && error.message === "Applicant not found"
            ? 404
            : 500,
      },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { jobId, resumeViewed, examCompleted, verifiedIdUploaded } =
      await request.json();

    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
    }

    const data = await upsertApplicationProgress(Number(jobId), {
      resumeViewed,
      examCompleted,
      verifiedIdUploaded,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Application progress update error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update application progress",
      },
      {
        status:
          error instanceof Error && error.message === "Applicant not found"
            ? 404
            : 500,
      },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
    }

    await deleteApplicationProgress(Number(jobId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Application progress delete error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete application progress",
      },
      {
        status:
          error instanceof Error && error.message === "Applicant not found"
            ? 404
            : 500,
      },
    );
  }
}

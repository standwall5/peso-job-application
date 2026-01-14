import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getExamAttemptForAdmin } from "@/lib/db/services/exam.service";

// GET /api/admin/exams/attempt?jobId=...&examId=...&applicantId=...
export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const jobIdParam = searchParams.get("jobId");
  const examIdParam = searchParams.get("examId");
  const applicantIdParam = searchParams.get("applicantId");

  // Validate parameters
  if (!jobIdParam || jobIdParam === "null" || jobIdParam === "undefined") {
    return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
  }

  if (!examIdParam || examIdParam === "null" || examIdParam === "undefined") {
    return NextResponse.json({ error: "Exam ID is required" }, { status: 400 });
  }

  if (
    !applicantIdParam ||
    applicantIdParam === "null" ||
    applicantIdParam === "undefined"
  ) {
    return NextResponse.json(
      { error: "Applicant ID is required" },
      { status: 400 }
    );
  }

  const jobId = parseInt(jobIdParam, 10);
  const examId = parseInt(examIdParam, 10);
  const applicantId = parseInt(applicantIdParam, 10);

  if (isNaN(jobId) || isNaN(examId) || isNaN(applicantId)) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  // Verify the logged-in user is an admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: adminData, error: adminError } = await supabase
    .from("peso")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (adminError || !adminData) {
    return NextResponse.json(
      { error: "Unauthorized - Admin access required" },
      { status: 403 }
    );
  }

  try {
    const result = await getExamAttemptForAdmin(jobId, examId, applicantId);

    if (!result) {
      return NextResponse.json({ attempt: null });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching exam attempt:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch exam attempt",
      },
      { status: 500 }
    );
  }
}

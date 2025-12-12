import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { job_id } = await request.json();

  // Get current logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Get applicant_id from applicants table
  const { data: applicantData, error: applicantError } = await supabase
    .from("applicants")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (applicantError || !applicantData) {
    return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
  }

  const applicant_id = applicantData.id;

  if (!job_id || !applicant_id) {
    return NextResponse.json(
      { error: "Missing job_id or applicant_id" },
      { status: 400 },
    );
  }

  // Check if application already exists
  const { data: existing, error: existingError } = await supabase
    .from("applications")
    .select("id")
    .eq("job_id", job_id)
    .eq("applicant_id", applicant_id)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  if (existing) {
    return NextResponse.json(
      { error: "You have already applied for this job." },
      { status: 409 },
    );
  }

  // Find the exam attempt for this job (if exists)
  const { data: examAttempt } = await supabase
    .from("exam_attempts")
    .select("attempt_id")
    .eq("job_id", job_id)
    .eq("applicant_id", applicant_id)
    .maybeSingle();

  // Insert application with exam_attempt_id if it exists
  const { data, error } = await supabase
    .from("applications")
    .insert([
      {
        job_id,
        applicant_id,
        exam_attempt_id: examAttempt?.attempt_id || null,
      },
    ])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

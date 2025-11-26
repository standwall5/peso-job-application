import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");

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

  if (jobId) {
    // Get progress for specific job
    const { data, error } = await supabase
      .from("application_progress")
      .select("*")
      .eq("job_id", jobId)
      .eq("applicant_id", applicant_id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ progress: data || null });
  } else {
    // Get all progress for this applicant
    const { data, error } = await supabase
      .from("application_progress")
      .select("*")
      .eq("applicant_id", applicant_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ progress: data || [] });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { jobId, resumeViewed, examCompleted, verifiedIdUploaded } =
    await request.json();

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

  if (!jobId) {
    return NextResponse.json(
      { error: "Missing jobId" },
      { status: 400 }
    );
  }

  // Upsert progress (insert or update)
  const { data, error } = await supabase
    .from("application_progress")
    .upsert(
      {
        job_id: jobId,
        applicant_id: applicant_id,
        resume_viewed: resumeViewed ?? false,
        exam_completed: examCompleted ?? false,
        verified_id_uploaded: verifiedIdUploaded ?? false,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "job_id,applicant_id",
      }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");

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

  if (!jobId) {
    return NextResponse.json(
      { error: "Missing jobId" },
      { status: 400 }
    );
  }

  // Delete progress for this job
  const { error } = await supabase
    .from("application_progress")
    .delete()
    .eq("job_id", jobId)
    .eq("applicant_id", applicant_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Get applicant record
  const { data: applicants, error: applicantError } = await supabase
    .from("applicants")
    .select("id")
    .eq("auth_id", user.id);

  if (applicantError || !applicants?.[0]) {
    return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
  }

  const applicantId = applicants[0].id;

  // Fetch resume data for this applicant
  const { data: resumes, error: resumeError } = await supabase
    .from("resume")
    .select("*")
    .eq("applicant_id", applicantId);

  if (resumeError || !resumes?.[0]) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  // Combine resume data and email
  const resume = resumes[0];
  const response = { ...resume, email: user.email };

  return NextResponse.json(response);
}

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  // Get all applications
  const { data: applications, error: appError } = await supabase
    .from("applications")
    .select("*");

  if (appError) {
    return NextResponse.json({ error: appError.message }, { status: 500 });
  }

  // For each application, fetch applicant, job, resume, and company info
  const results = await Promise.all(
    (applications ?? []).map(async (app) => {
      // Get applicant info
      const { data: applicant } = await supabase
        .from("applicants")
        .select("*")
        .eq("id", app.applicant_id)
        .single();

      // Get job info
      const { data: job } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", app.job_id)
        .single();

      // Get company info based on job.company_id
      let company = null;
      if (job?.company_id) {
        const { data: companyData } = await supabase
          .from("companies")
          .select("*")
          .eq("id", job.company_id)
          .single();
        company = companyData;
      }

      // Get resume info
      const { data: resume } = await supabase
        .from("resume")
        .select("*")
        .eq("applicant_id", app.applicant_id)
        .single();

      // Add profile_pic_url from applicant to resume and nest job/company
      const resumeWithDetails = resume
        ? {
            ...resume,
            profile_pic_url: applicant?.profile_pic_url ?? null,
            job: job ?? null,
            company: company ?? null,
            applicant: applicant ?? null,
          }
        : null;

      return {
        ...app,
        applicant,
        job,
        company,
        resume: resumeWithDetails,
      };
    })
  );

  return NextResponse.json(results);
}

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const applicant_id = searchParams.get("applicant_id");

  if (!applicant_id) {
    return NextResponse.json(
      { error: "Applicant ID is required" },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  // Get all applications for this applicant
  const { data: applications, error: appError } = await supabase
    .from("applications")
    .select("*")
    .eq("applicant_id", applicant_id);

  if (appError) {
    return NextResponse.json({ error: appError.message }, { status: 500 });
  }

  // For each application, fetch job and company info
  const results = await Promise.all(
    (applications ?? []).map(async (app) => {
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

      return {
        ...app,
        job: job ?? null,
        company: company ?? null,
      };
    }),
  );

  return NextResponse.json(results);
}

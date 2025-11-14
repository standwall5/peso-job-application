import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: companies, error: appError } = await supabase
    .from("companies")
    .select("*");

  if (appError) {
    return NextResponse.json({ error: appError.message }, { status: 500 });
  }

  const results = await Promise.all(
    (companies ?? []).map(async (company) => {
      const { data: jobs } = await supabase
        .from("jobs")
        .select("*")
        .eq("company_id", company.id);

      const totalManpower = (jobs ?? []).reduce(
        (sum, job) => sum + (job.manpower_needed ?? 0),
        0
      );

      const totalJobsPosted = jobs ? jobs.length : 0;

      return {
        ...company,
        jobs: jobs ?? [],
        totalManpower,
        totalJobsPosted,
      };
    })
  );

  const totalJobsAllCompanies = results.reduce(
    (sum, company) => sum + (company.totalJobsPosted ?? 0),
    0
  );

  return NextResponse.json({
    companies: results,
    totalJobsAllCompanies,
  });
}

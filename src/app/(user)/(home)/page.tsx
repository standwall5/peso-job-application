import React from "react";
import { createClient } from "@/utils/supabase/server";
import LoginPage from "@/app/(auth)/login/page";
import HomePageClient from "./components/HomePageClient";
import {
  getCompanies,
  Company as ServiceCompany,
} from "@/lib/db/services/company.service";
import { getJobs, Job as ServiceJob } from "@/lib/db/services/job.service";
import { getResume } from "@/lib/db/services/resume.service";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <LoginPage />;
  }

  // Fetch data on the server
  const [companiesData, jobsData, resumeData] = await Promise.all([
    getCompanies().catch(() => [] as ServiceCompany[]),
    getJobs().catch(() => [] as ServiceJob[]),
    getResume().catch(() => null),
  ]);

  // Transform to match component types
  const companies = companiesData.map((c) => ({
    ...c,
    industry: c.industry || "",
    location: c.location || "",
    description: c.description || "",
  }));

  const jobs = jobsData.map((j) => ({
    ...j,
    company_id: j.company_id,
  }));

  // Check if user has a resume
  const hasResume = resumeData !== null;

  return (
    <HomePageClient
      initialCompanies={companies}
      initialJobs={jobs}
      hasResume={hasResume}
    />
  );
}

import React from "react";
import { createClient } from "@/utils/supabase/server";
import LoginPage from "@/app/(auth)/login/page";
import PrivateCompanyListWithRecommendations from "../job-opportunities/components/PrivateCompanyListWithRecommendations";
import {
  getCompanies,
  Company as ServiceCompany,
} from "@/lib/db/services/company.service";
import { getJobs, Job as ServiceJob } from "@/lib/db/services/job.service";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <LoginPage />;
  }

  // Fetch data on the server
  const [companiesData, jobsData] = await Promise.all([
    getCompanies().catch(() => [] as ServiceCompany[]),
    getJobs().catch(() => [] as ServiceJob[]),
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

  return (
    <PrivateCompanyListWithRecommendations
      initialCompanies={companies}
      initialJobs={jobs}
      searchParent=""
    />
  );
}

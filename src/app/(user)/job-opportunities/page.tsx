import React from "react";
import { createClient } from "@/utils/supabase/server";
import PublicCompanyList from "./components/PublicCompanyList";
import PrivateCompanyListWithRecommendations from "./components/PrivateCompanyListWithRecommendations";
import {
  getCompanies,
  Company as ServiceCompany,
} from "@/lib/db/services/company.service";
import { getJobs, Job as ServiceJob } from "@/lib/db/services/job.service";

interface PageProps {
  searchParams: { search?: string };
}

export default async function JobOpportunitiesPage({
  searchParams,
}: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const search = searchParams.search || "";

  // Fetch data on the server - only once, no repeated client-side calls!
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

  if (!user) {
    return (
      <PublicCompanyList
        initialCompanies={companies}
        initialJobs={jobs}
        searchParent={search}
      />
    );
  }

  return (
    <PrivateCompanyListWithRecommendations
      initialCompanies={companies}
      initialJobs={jobs}
      searchParent={search}
    />
  );
}

"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import PublicCompanyList from "@/app/(user)/job-opportunities/components/PublicCompanyList";
import BlocksWave from "@/components/BlocksWave";

interface Job {
  id: number;
  company_id: number;
  manpower_needed?: number;
  posted_date: string | null;
}

interface Company {
  id: number;
  name: string;
  logo: string | null;
  industry: string;
  location: string;
  description: string;
}

interface PublicSearchProp {
  search: string;
  onSearchChange?: (value: string) => void;
}

const PublicSearch = ({ search }: PublicSearchProp) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: companiesData } = await supabase
        .from("companies")
        .select("*")
        .order("name");

      const { data: jobsData } = await supabase
        .from("jobs")
        .select("id, company_id, manpower_needed, posted_date");

      setCompanies(companiesData || []);
      setJobs(jobsData || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          width: "100%",
        }}
      >
        <BlocksWave />
      </div>
    );
  }

  return (
    <PublicCompanyList
      initialCompanies={companies}
      initialJobs={jobs}
      searchParent={search}
    />
  );
};

export default PublicSearch;

"use client";
import React, { useState, useEffect, Suspense } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useSearchParams } from "next/navigation";

import PublicCompanyList from "./components/PublicCompanyList";
import PrivateCompanyListWithRecommendations from "./components/PrivateCompanyListWithRecommendations";
import BlocksWave from "@/components/BlocksWave";

interface Job {
  id: number;
  company_id: number;
  manpower_needed?: number;
  posted_date: string | null;
}

interface JobWithCompanyId {
  id: number;
  title: string;
  description: string;
  place_of_assignment: string;
  sex: string;
  education: string;
  eligibility: string;
  posted_date: string | null;
  company_id: number;
  manpower_needed?: number;
  exam_id?: number | null;
  companies: {
    name: string;
    logo: string | null;
  };
}

interface Company {
  id: number;
  name: string;
  logo: string | null;
  industry: string;
  location: string;
  description: string;
}

export const CompaniesContent = () => {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsWithCompany, setJobsWithCompany] = useState<JobWithCompanyId[]>(
    [],
  );
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };

    checkUser();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { data: companiesData } = await supabase
        .from("companies")
        .select("*")
        .order("name");

      const { data: jobsData } = await supabase
        .from("jobs")
        .select("id, company_id, manpower_needed, posted_date");

      const { data: jobsWithCompanyData } = await supabase
        .from("jobs")
        .select("*, companies(name, logo)");

      setCompanies(companiesData || []);
      setJobs(jobsData || []);
      setJobsWithCompany(jobsWithCompanyData || []);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const searchQuery = searchParams.get("search");
    if (searchQuery) {
      setSearch(searchQuery);
    }
  }, [searchParams]);

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
      initialJobs={jobsWithCompany}
      searchParent={search}
    />
  );
};

const Companies = () => {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <BlocksWave />
        </div>
      }
    >
      <CompaniesContent />
    </Suspense>
  );
};

export default Companies;

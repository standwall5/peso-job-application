// src/app/(user)/job-opportunities/[companyId]/hooks/useJobs.ts
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Job } from "../types/job.types";
import { JobSortOption } from "../components/sort/SortJobs";
import { sortJobs } from "../utils/sortJobs";

export const useJobs = (companyId: string | string[] | undefined) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState<JobSortOption>("recent");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!companyId) return;

      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("jobs")
        .select("*, companies(*)")
        .eq("company_id", companyId);

      if (error) {
        console.log(error);
        setLoading(false);
        return;
      }
      setJobs(data || []);
      setLoading(false);
    }

    fetchData();
  }, [companyId]);

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.description.toLowerCase().includes(search.toLowerCase())
  );

  const sortedJobs = sortJobs(filteredJobs, sortOption);

  return {
    jobs: sortedJobs,
    search,
    setSearch,
    sortOption,
    setSortOption,
    loading,
  };
};

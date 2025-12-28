// src/app/admin/company-profiles/hooks/useCompanyData.ts

import { useState, useEffect } from "react";
import { getCompaniesWithStats } from "@/lib/db/services/company.service";
import { Company } from "../types/company.types";

export const useCompanyData = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [totalJobsAllCompanies, setTotalJobsAllCompanies] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const data = await getCompaniesWithStats();
      setCompanies(data.companies);
      setTotalJobsAllCompanies(data.totalJobsAllCompanies);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(search.toLowerCase()) ||
      company.location?.toLowerCase().includes(search.toLowerCase()) ||
      company.industry?.toLowerCase().includes(search.toLowerCase()) ||
      company.description?.toLowerCase().includes(search.toLowerCase()),
  );

  return {
    companies,
    filteredCompanies,
    totalJobsAllCompanies,
    loading,
    search,
    setSearch,
    fetchCompanies,
  };
};

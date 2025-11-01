import React from "react";
import { useParams } from "next/navigation";
import styles from "@/app/job-opportunities/JobHome.module.css";
import jobStyle from "@/app/job-opportunities/[companyId]/JobsOfCompany.module.css";
import PublicJobList from "@/app/job-opportunities/[companyId]/components/PublicJobList";
import PublicCompanyList from "@/app/job-opportunities/components/PublicCompanyList";

interface PublicSearchProp {
  search: string;
  onSearchChange?: (value: string) => void;
}

const PublicSearch = ({ search, onSearchChange }: PublicSearchProp) => {
  return (
    <PublicCompanyList searchParent={search} onSearchChange={onSearchChange} />
  );
};

export default PublicSearch;

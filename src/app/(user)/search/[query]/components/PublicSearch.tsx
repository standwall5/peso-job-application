import React from "react";
import PublicCompanyList from "@/app/(user)/job-opportunities/components/PublicCompanyList";

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

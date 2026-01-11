"use client";

import React from "react";
import CustomSelect from "@/components/CustomSelect";

export type SortOption =
  | "recent"
  | "most-jobs"
  | "least-jobs"
  | "most-manpower"
  | "name-asc"
  | "name-desc"
  | "deadline-soon";

interface SortCompanyProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const options = [
  { value: "recent", label: "Recently Posted Jobs" },
  { value: "most-jobs", label: "Most Jobs" },
  { value: "most-manpower", label: "Most Manpower Needed" },
  { value: "least-jobs", label: "Least Jobs" },
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "deadline-soon", label: "Deadline Soon"}
];

const SortCompany = ({ currentSort, onSortChange }: SortCompanyProps) => {
  return (
    <CustomSelect
      label="Sort by:"
      options={options}
      value={currentSort}
      onChange={(value) => onSortChange(value as SortOption)}
    />
  );
};

export default SortCompany;

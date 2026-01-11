"use client";

import React from "react";
import CustomSelect from "@/components/CustomSelect";

export type JobSortOption =
  | "relevance"
  | "recent"
  | "oldest"
  | "title-asc"
  | "title-desc"
  | "most-manpower";

interface SortJobsProps {
  currentSort: JobSortOption;
  onSortChange: (sort: JobSortOption) => void;
}

const options = [
  { value: "relevance", label: "Most Relevant (Skill Match)" },
  { value: "recent", label: "Recently Posted" },
  { value: "oldest", label: "Oldest First" },
  { value: "most-manpower", label: "Most Manpower Needed" },
  { value: "title-asc", label: "Title (A-Z)" },
  { value: "title-desc", label: "Title (Z-A)" },
];

const SortJobs = ({ currentSort, onSortChange }: SortJobsProps) => {
  return (
    <CustomSelect
      label="Sort by:"
      options={options}
      value={currentSort}
      onChange={(value) => onSortChange(value as JobSortOption)}
    />
  );
};

export default SortJobs;

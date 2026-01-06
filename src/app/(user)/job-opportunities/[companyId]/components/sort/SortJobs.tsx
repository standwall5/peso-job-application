"use client";

import React from "react";
import CustomSelect from "@/components/CustomSelect";

export type JobSortOption =
  | "recent"
  | "oldest"
  | "title-asc"
  | "title-desc"
  | "salary-high"
  | "salary-low"
  | "deadline-soon"
  | "most-manpower";

interface SortJobsProps {
  currentSort: JobSortOption;
  onSortChange: (sort: JobSortOption) => void;
}

const options = [
  { value: "recent", label: "Recently Posted" },
  { value: "oldest", label: "Oldest First" },
  { value: "deadline-soon", label: "Deadline Soon" },
  { value: "most-manpower", label: "Most Manpower Needed" },
  { value: "title-asc", label: "Title (A-Z)" },
  { value: "title-desc", label: "Title (Z-A)" },
  { value: "salary-high", label: "Highest Salary" },
  { value: "salary-low", label: "Lowest Salary" },
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

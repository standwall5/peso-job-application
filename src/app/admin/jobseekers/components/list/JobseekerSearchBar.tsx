// src/app/admin/jobseekers/components/list/JobseekerSearchBar.tsx

import React from "react";
import styles from "../Jobseekers.module.css";

interface JobseekerSearchBarProps {
  search: string;
  setSearch: (search: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  selectedApplicantTypes: string[];
  setSelectedApplicantTypes: React.Dispatch<React.SetStateAction<string[]>>;
  selectedPlaces: string[];
  setSelectedPlaces: React.Dispatch<React.SetStateAction<string[]>>;
}

const APPLICANT_TYPES = [
  "Student",
  "Indigenous Person (IP)",
  "Out of School Youth",
  "Person with Disability (PWD)",
  "Rehabilitation Program Graduate",
  "Reintegrated Individual (Former Detainee)",
  "Returning Overseas Filipino Worker (OFW)",
  "Senior Citizen",
  "Solo Parent/Single Parent",
  "Others",
];

const PREFERRED_PLACES = ["Paranaque", "Las Piñas", "Muntinlupa"];

const JobseekerSearchBar: React.FC<JobseekerSearchBarProps> = ({
  search,
  setSearch,
  sortBy,
  setSortBy,
  selectedApplicantTypes,
  setSelectedApplicantTypes,
  selectedPlaces,
  setSelectedPlaces,
}) => {
  const [showSortMenu, setShowSortMenu] = React.useState(false);
  const [showTypeFilter, setShowTypeFilter] = React.useState(false);
  const [showPlaceFilter, setShowPlaceFilter] = React.useState(false);

  const toggleApplicantType = (type: string) => {
    setSelectedApplicantTypes((prev: string[]) =>
      prev.includes(type)
        ? prev.filter((t: string) => t !== type)
        : [...prev, type],
    );
  };

  const togglePlace = (place: string) => {
    setSelectedPlaces((prev: string[]) =>
      prev.includes(place)
        ? prev.filter((p: string) => p !== place)
        : [...prev, place],
    );
  };

  return (
    <div className={styles.topBar}>
      {/* Center - Search */}
      <div className={styles.searchContainer}>
        <div className={styles.search}>
          <input
            type="text"
            placeholder="Search name, gender, place of assignment, etc."
            value={search ?? ""}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className={styles.searchIcon}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Right side - Controls below sort */}
      <div className={styles.topRightControls}>
        {/* Top row: Sort By */}
        <div className={styles.topRowControls}>
          <div style={{ position: "relative" }}>
            <button
              className={styles.sortByButton}
              onClick={() => setShowSortMenu(!showSortMenu)}
            >
              SORT BY
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                style={{ width: "1rem", height: "1rem" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
                />
              </svg>
            </button>
            {showSortMenu && (
              <div className={styles.sortDropdown}>
                <button
                  onClick={() => {
                    setSortBy("name");
                    setShowSortMenu(false);
                  }}
                >
                  Name
                </button>
                <button
                  onClick={() => {
                    setSortBy("date");
                    setShowSortMenu(false);
                  }}
                >
                  Date Applied
                </button>
                <button
                  onClick={() => {
                    setSortBy("type");
                    setShowSortMenu(false);
                  }}
                >
                  Applicant Type
                </button>
                <button
                  onClick={() => {
                    setSortBy("place");
                    setShowSortMenu(false);
                  }}
                >
                  Place of Assignment
                </button>
              </div>
            )}
          </div>

          {/* Filter by Applicant Type */}
          <div className={styles.filterGroup}>
            <button
              className={styles.filterButton}
              onClick={() => setShowTypeFilter(!showTypeFilter)}
            >
              Applicant Type
              {selectedApplicantTypes.length > 0 && (
                <span className={styles.filterCount}>
                  ({selectedApplicantTypes.length})
                </span>
              )}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                style={{ width: "1rem", height: "1rem", marginLeft: "0.25rem" }}
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {showTypeFilter && (
              <div className={styles.filterDropdown}>
                {APPLICANT_TYPES.map((type) => (
                  <label key={type} className={styles.filterCheckbox}>
                    <input
                      type="checkbox"
                      checked={selectedApplicantTypes.includes(type)}
                      onChange={() => toggleApplicantType(type)}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Filter by Place of Assignment */}
          <div className={styles.filterGroup}>
            <button
              className={styles.filterButton}
              onClick={() => setShowPlaceFilter(!showPlaceFilter)}
            >
              Place of Assignment
              {selectedPlaces.length > 0 && (
                <span className={styles.filterCount}>
                  ({selectedPlaces.length})
                </span>
              )}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                style={{ width: "1rem", height: "1rem", marginLeft: "0.25rem" }}
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {showPlaceFilter && (
              <div className={styles.filterDropdown}>
                {PREFERRED_PLACES.map((place) => (
                  <label key={place} className={styles.filterCheckbox}>
                    <input
                      type="checkbox"
                      checked={selectedPlaces.includes(place)}
                      onChange={() => togglePlace(place)}
                    />
                    <span>{place}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobseekerSearchBar;

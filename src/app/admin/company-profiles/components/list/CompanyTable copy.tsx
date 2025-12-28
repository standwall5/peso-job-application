// src/app/admin/company-profiles/components/list/CompanyTable.tsx

import React from "react";
import styles from "../CompanyProfiles.module.css";
import { Company } from "../../types/company.types";

interface CompanyTableProps {
  companies: Company[];
  onViewCompany: (company: Company) => void;
  onManageCompany: (company: Company) => void;
}

const CompanyTable: React.FC<CompanyTableProps> = ({
  companies,
  onViewCompany,
  onManageCompany,
}) => {
  if (companies.length === 0) {
    return (
      <div className={styles.notFound}>
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
            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
          />
        </svg>
        <h3>No Companies found.</h3>
      </div>
    );
  }

  return (
    <div className={styles.jobseekersTable}>
      <div className={styles.tableHeader}>
        <div className={styles.jobseekersDetailsHeader}>
          <div>COMPANY NAME</div>
          <div>PLACE OF ASSIGNMENT</div>
          <div>JOBS POSTED</div>
          <div>MANPOWER NEEDED</div>
          <div>STATUS</div>
        </div>
        <div>ABOUT COMPANY</div>
        <div>SELECT</div>
      </div>

      {companies.map((company) => (
        <div className={styles.tableRow} key={company.id}>
          <div
            className={styles.jobseekersDetails}
            onClick={() => onViewCompany(company)}
          >
            <div className={styles.avatarCell}>
              <img
                src={company.logo ?? "/assets/images/default_profile.png"}
                alt={company.name}
                className={styles.avatar}
              />
              <span>{company.name}</span>
            </div>
            <div>{company.location}</div>
            <div>{company.totalJobsPosted}</div>
            <div>{company.totalManpower}</div>

            <div className={styles.status}>
              <span className={`${styles.status} ${styles.active}`}>
                ACTIVE
              </span>
            </div>
          </div>

          <div>
            <button
              className={styles.detailsBtn}
              onClick={() => onManageCompany(company)}
            >
              Manage Details
            </button>
          </div>

          <div className={styles.checkbox}>
            <input type="checkbox" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default CompanyTable;

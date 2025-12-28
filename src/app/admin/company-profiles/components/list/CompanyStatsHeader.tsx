// src/app/admin/company-profiles/components/list/CompanyStatsHeader.tsx

import React from "react";
import styles from "../CompanyProfiles.module.css";

interface CompanyStatsHeaderProps {
  totalCompanies: number;
  totalJobVacancies: number;
}

const CompanyStatsHeader: React.FC<CompanyStatsHeaderProps> = ({
  totalCompanies,
  totalJobVacancies,
}) => {
  return (
    <div className={styles.totalStatistics}>
      <strong>TOTAL OF COMPANIES: {totalCompanies}</strong>
      <strong>TOTAL OF JOB VACANCIES: {totalJobVacancies}</strong>
    </div>
  );
};

export default CompanyStatsHeader;

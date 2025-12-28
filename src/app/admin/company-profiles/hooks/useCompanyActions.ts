// src/app/admin/company-profiles/hooks/useCompanyActions.ts

import { useState } from "react";
import { Company } from "../types/company.types";

export const useCompanyActions = (onRefresh: () => Promise<void>) => {
  const [showCreateCompany, setShowCreateCompany] = useState(false);
  const [showManageCompany, setShowManageCompany] = useState(false);
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const handleViewCompany = (company: Company) => {
    setSelectedCompany(company);
    setShowCompanyDetails(true);
  };

  const handleManageCompany = (company: Company) => {
    setSelectedCompany(company);
    setShowManageCompany(true);
    setShowCompanyDetails(false);
  };

  const handleCloseAll = () => {
    setShowCreateCompany(false);
    setShowManageCompany(false);
    setShowCompanyDetails(false);
    setSelectedCompany(null);
  };

  return {
    showCreateCompany,
    setShowCreateCompany,
    showManageCompany,
    setShowManageCompany,
    showCompanyDetails,
    selectedCompany,
    handleViewCompany,
    handleManageCompany,
    handleCloseAll,
  };
};

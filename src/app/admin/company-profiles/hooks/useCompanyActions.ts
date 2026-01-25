// src/app/admin/company-profiles/hooks/useCompanyActions.ts

import { useState } from "react";
import { Company } from "../types/company.types";

export const useCompanyActions = () => {
  const [showCreateCompany, setShowCreateCompany] = useState(false);
  const [showManageCompany, setShowManageCompany] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company);
    setShowCreateCompany(true);
    setShowManageCompany(false);
  };

  const handleManageCompany = (company: Company) => {
    setSelectedCompany(company);
    setShowManageCompany(true);
    setShowCreateCompany(false);
  };

  const handleCloseAll = () => {
    setShowCreateCompany(false);
    setShowManageCompany(false);
    setSelectedCompany(null);
  };

  return {
    showCreateCompany,
    setShowCreateCompany,
    showManageCompany,
    setShowManageCompany,
    selectedCompany,
    handleEditCompany,
    handleManageCompany,
    handleCloseAll,
  };
};

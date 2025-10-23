import React from "react";
import PrivateCompanyList from "@/app/job-opportunities/components/PrivateCompanyList";

const PrivateHome = () => {
  // If no resume, prompt create resume
  // This page is company list
  return <PrivateCompanyList searchParent={""} />;
};

export default PrivateHome;

"use client";

import React, { useState, useEffect } from "react";
import PrivateCompanyListWithRecommendations from "../../job-opportunities/components/PrivateCompanyListWithRecommendations";
import WelcomeResumeModal from "@/components/WelcomeResumeModal";

interface HomePageClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialCompanies: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialJobs: any;
  hasResume: boolean;
}

export default function HomePageClient({
  initialCompanies,
  initialJobs,
  hasResume,
}: HomePageClientProps) {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    // Check if user has already seen the modal in this session
    const hasSeenModal = sessionStorage.getItem("hasSeenWelcomeModal");

    // Show modal only if user doesn't have resume and hasn't seen it this session
    if (!hasResume && !hasSeenModal) {
      setShowWelcomeModal(true);
    }
  }, [hasResume]);

  const handleSkipModal = () => {
    setShowWelcomeModal(false);
    // Mark as seen for this session
    sessionStorage.setItem("hasSeenWelcomeModal", "true");
  };

  return (
    <>
      <WelcomeResumeModal show={showWelcomeModal} onSkip={handleSkipModal} />
      <PrivateCompanyListWithRecommendations
        initialCompanies={initialCompanies}
        initialJobs={initialJobs}
        searchParent=""
      />
    </>
  );
}

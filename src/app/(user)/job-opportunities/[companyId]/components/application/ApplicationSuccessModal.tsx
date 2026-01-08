"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import jobStyle from "../../JobsOfCompany.module.css";

interface ApplicationSuccessModalProps {
  onClose: () => void;
}

const ApplicationSuccessModal: React.FC<ApplicationSuccessModalProps> = ({
  onClose,
}) => {
  const router = useRouter();
  const { t } = useLanguage();

  const handleViewApplications = () => {
    onClose();
    router.push("/profile?tab=applications");
  };

  return (
    <div className={jobStyle.modalOverlay} onClick={onClose}>
      <div
        className={`${jobStyle.modal} warningModal`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{ fontWeight: "bold", right: 30, position: "absolute" }}
        >
          X
        </button>
        <div className="warningContainer">
          <h2 style={{ color: "#22c55e", marginBottom: "1rem" }}>
            ✓ {t("application.success")}
          </h2>
          <div className="warningContent">
            <p style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>
              {t("application.applicationSubmitted")}
            </p>
            <p style={{ color: "#64748b", marginBottom: "2rem" }}>
              {t("application.checkAppliedJobs")}
            </p>
            <div
              style={{ display: "flex", gap: "1rem", justifyContent: "center" }}
            >
              <Button variant="primary" onClick={handleViewApplications}>
                {t("profile.myApplications")}
              </Button>
              <Button variant="danger" onClick={onClose}>
                {t("common.close")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationSuccessModal;

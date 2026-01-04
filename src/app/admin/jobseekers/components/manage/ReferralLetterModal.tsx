import React, { useRef } from "react";
import Button from "@/components/Button";
import ReferralLetter, { ReferralLetterRef } from "../ReferralLetter";
import styles from "../ManageJobseeker.module.css";
import { Jobseeker, JobApplication } from "../../types/jobseeker.types";

interface ReferralLetterModalProps {
  jobseeker: Jobseeker;
  application: JobApplication;
  onClose: () => void;
  onDownload: (
    applicationId: number,
    downloadPDF: () => Promise<void>,
  ) => Promise<void>;
}

export default function ReferralLetterModal({
  jobseeker,
  application,
  onClose,
  onDownload,
}: ReferralLetterModalProps) {
  const referralLetterRef = useRef<ReferralLetterRef>(null);

  const handleDownload = async () => {
    if (referralLetterRef.current?.downloadPDF) {
      await onDownload(application.id, referralLetterRef.current.downloadPDF);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className={styles.closeBtn}>
          X
        </button>
        <h2>Referral Letter</h2>
        <div className={styles.referralContent}>
          <ReferralLetter
            ref={referralLetterRef}
            jobseeker={jobseeker}
            application={application}
            recipientName="MS. RUFFA MAE G. REYES"
            recipientTitle="HR Assistant"
          />
        </div>
        <div className={styles.modalActions}>
          <Button variant="success" onClick={handleDownload}>
            Download & Mark as Referred
          </Button>
          <Button variant="danger" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

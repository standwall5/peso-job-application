import React, { forwardRef, useImperativeHandle } from "react";
import styles from "./ReferralLetter.module.css";
import { Jobseeker, JobApplication } from "../types/jobseeker.types";
import { useReferralLetter } from "../hooks/useReferralLetter";
import ReferralHeader from "./referral/ReferralHeader";
import ReferralRecipient from "./referral/ReferralRecipient";
import ReferralBody from "./referral/ReferralBody";
import ReferralSignature from "./referral/ReferralSignature";

interface ReferralLetterProps {
  jobseeker: Jobseeker;
  application: JobApplication;
  recipientName?: string;
  recipientTitle?: string;
}

export interface ReferralLetterRef {
  downloadPDF: () => Promise<void>;
}

const ReferralLetter = forwardRef<ReferralLetterRef, ReferralLetterProps>(
  (
    {
      jobseeker,
      application,
      recipientName: initialRecipientName = "HR MANAGER",
      recipientTitle: initialRecipientTitle = "HR Manager",
    },
    ref,
  ) => {
    const {
      resumeRef,
      bodyEditorRef,
      recipientName,
      setRecipientName,
      recipientTitle,
      setRecipientTitle,
      companyName,
      setCompanyName,
      companyLocation,
      setCompanyLocation,
      placeOfAssignment,
      setPlaceOfAssignment,
      bodyHTML,
      signerName,
      setSignerName,
      signerTitle,
      setSignerTitle,
      editingField,
      setEditingField,
      date,
      handleDownloadPDF,
      saveBodyContent,
    } = useReferralLetter(
      jobseeker,
      application,
      initialRecipientName,
      initialRecipientTitle,
    );

    useImperativeHandle(ref, () => ({
      downloadPDF: handleDownloadPDF,
    }));

    return (
      <div ref={resumeRef} className={styles.container}>
        <ReferralHeader />

        <ReferralRecipient
          date={date}
          recipientName={recipientName}
          setRecipientName={setRecipientName}
          recipientTitle={recipientTitle}
          setRecipientTitle={setRecipientTitle}
          companyName={companyName}
          setCompanyName={setCompanyName}
          companyLocation={companyLocation}
          setCompanyLocation={setCompanyLocation}
          placeOfAssignment={placeOfAssignment}
          setPlaceOfAssignment={setPlaceOfAssignment}
          editingField={editingField}
          setEditingField={setEditingField}
        />

        <ReferralBody
          bodyHTML={bodyHTML}
          editingField={editingField}
          setEditingField={setEditingField}
          bodyEditorRef={bodyEditorRef}
          onSave={saveBodyContent}
        />

        <ReferralSignature
          signerName={signerName}
          setSignerName={setSignerName}
          signerTitle={signerTitle}
          setSignerTitle={setSignerTitle}
          editingField={editingField}
          setEditingField={setEditingField}
        />
      </div>
    );
  },
);

ReferralLetter.displayName = "ReferralLetter";

export default ReferralLetter;

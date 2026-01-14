import { useState, useRef } from "react";
import { Jobseeker, JobApplication } from "../types/jobseeker.types";

export function useReferralLetter(
  jobseeker: Jobseeker,
  application: JobApplication,
  initialRecipientName: string,
  initialRecipientTitle: string,
) {
  const resumeRef = useRef<HTMLDivElement>(null);
  const bodyEditorRef = useRef<HTMLDivElement>(null);

  // Editable state
  const [recipientName, setRecipientName] = useState(initialRecipientName);
  const [recipientTitle, setRecipientTitle] = useState(initialRecipientTitle);
  const [companyName, setCompanyName] = useState(application.company?.name || "");
  const [companyLocation, setCompanyLocation] = useState(
    application.company?.location || "",
  );
  const [placeOfAssignment, setPlaceOfAssignment] = useState(
    application.job?.place_of_assignment || "",
  );

  // Combined body text with HTML formatting
  const [bodyHTML, setBodyHTML] = useState(
    `<p><strong>Dear ${recipientName.split(" ").slice(1).join(" ") || "Sir/Madam"}:</strong></p>
      <p>The City Government of Parañaque through its <strong>Public Employment Service Office-Parañaque (PESO-Parañaque)</strong> is mandated to facilitate employment for the unemployed residents of the city.</p>
      <p>In line with this, we respectfully refer to your office <strong>${jobseeker.applicant.sex === "Male" ? "Mr." : "Ms."} ${jobseeker.applicant.name}</strong> for the position of <strong>${application.job?.title || ""}</strong> or any job post commensurate to ${jobseeker.applicant.sex === "Male" ? "his" : "her"} qualification.</p>
      <p>We hope that you will consider this referral favorably. Thank you and more power.</p>`,
  );

  const [signerName, setSignerName] = useState("ATTY. [NAME]");
  const [signerTitle, setSignerTitle] = useState("PESO Manager");

  // Track which field is being edited
  const [editingField, setEditingField] = useState<string | null>(null);

  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleDownloadPDF = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    if (resumeRef.current && jobseeker) {
      html2pdf()
        .set({
          margin: 0.5,
          filename: `Referral_Letter_${jobseeker.applicant.name.replace(/\s+/g, "_")}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        })
        .from(resumeRef.current)
        .save();
    }
  };

  const saveBodyContent = () => {
    if (bodyEditorRef.current) {
      setBodyHTML(bodyEditorRef.current.innerHTML);
    }
    setEditingField(null);
  };

  return {
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
    setBodyHTML,
    signerName,
    setSignerName,
    signerTitle,
    setSignerTitle,
    editingField,
    setEditingField,
    date,
    handleDownloadPDF,
    saveBodyContent,
  };
}

import React, {
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import Button from "@/components/Button";
import styles from "./ReferralLetter.module.css";

interface WorkExperience {
  company: string;
  position: string;
  location: string;
  start_date: string;
  end_date: string;
  description?: string;
}

interface Education {
  school?: string;
  degree?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
}

interface JobApplication {
  id: number;
  applicant_id: number;
  job_id: number;
  status: string;
  applied_date: string;
  company: {
    id: number;
    name: string;
    logo?: string | null;
    location: string;
  };
  job: {
    id: number;
    title: string;
    place_of_assignment: string;
    sex: string;
    education: string;
    eligibility: string;
    posted_date: string;
    exam_id: number;
  };
}

interface Jobseeker {
  id: number;
  applicant: {
    name: string;
    birth_date: string;
    age: number;
    address: string;
    sex: string;
    barangay: string;
    district: string;
    email: string;
    phone: string;
    profile_pic_url: string | null;
    preferred_poa: string;
    applicant_type: string;
    disability_type?: string;
  };
  resume: {
    profile_pic_url: string | null;
    education: Education;
    skills: string[] | string;
    work_experiences: WorkExperience[];
    profile_introduction?: string;
  } | null;
}

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
    const resumeRef = useRef<HTMLDivElement>(null);
    const bodyEditorRef = useRef<HTMLDivElement>(null);

    // Editable state
    const [recipientName, setRecipientName] = useState(initialRecipientName);
    const [recipientTitle, setRecipientTitle] = useState(initialRecipientTitle);
    const [companyName, setCompanyName] = useState(application.company.name);
    const [companyLocation, setCompanyLocation] = useState(
      application.company.location,
    );
    const [placeOfAssignment, setPlaceOfAssignment] = useState(
      application.job.place_of_assignment,
    );

    // Combined body text with HTML formatting
    const [bodyHTML, setBodyHTML] = useState(
      `<p><strong>Dear ${recipientName.split(" ").slice(1).join(" ") || "Sir/Madam"}:</strong></p>
      <p>The City Government of Parañaque through its <strong>Public Employment Service Office-Parañaque (PESO-Parañaque)</strong> is mandated to facilitate employment for the unemployed residents of the city.</p>
      <p>In line with this, we respectfully refer to your office <strong>${jobseeker.applicant.sex === "Male" ? "Mr." : "Ms."} ${jobseeker.applicant.name}</strong> for the position of <strong>${application.job.title}</strong> or any job post commensurate to ${jobseeker.applicant.sex === "Male" ? "his" : "her"} qualification.</p>
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

    useImperativeHandle(ref, () => ({
      downloadPDF: handleDownloadPDF,
    }));

    // Format text using document.execCommand (simple approach)
    const formatText = (command: string) => {
      document.execCommand(command, false, undefined);
      bodyEditorRef.current?.focus();
    };

    const saveBodyContent = () => {
      if (bodyEditorRef.current) {
        setBodyHTML(bodyEditorRef.current.innerHTML);
      }
      setEditingField(null);
    };

    // Editable field component
    const EditableField = ({
      value,
      onChange,
      fieldName,
      className,
      multiline = false,
      uppercase = false,
      rows = 1,
    }: {
      value: string;
      onChange: (val: string) => void;
      fieldName: string;
      className: string;
      multiline?: boolean;
      uppercase?: boolean;
      rows?: number;
    }) => {
      const isEditing = editingField === fieldName;
      const displayValue = uppercase ? value.toUpperCase() : value;

      if (isEditing) {
        if (multiline) {
          return (
            <textarea
              className={`${className} ${styles.editableInput}`}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={() => setEditingField(null)}
              autoFocus
              rows={rows}
            />
          );
        }
        return (
          <input
            type="text"
            className={`${className} ${styles.editableInput}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => setEditingField(null)}
            autoFocus
          />
        );
      }

      return (
        <span
          className={`${className} ${styles.editable}`}
          onClick={() => setEditingField(fieldName)}
          title="Click to edit"
        >
          {displayValue}
        </span>
      );
    };

    return (
      <div ref={resumeRef} className={styles.container}>
        {/* Header Section */}
        <div className={styles.header}>
          {/* Left Logos */}
          <div className={styles.logoContainer}>
            <div className={styles.logo}>
              <img
                src="/assets/paranaqueLogo.png"
                alt="Parañaque Logo"
                className={styles.logoImage}
              />
            </div>

            <div className={styles.logo}>
              <img
                src="/assets/doleLogo.webp"
                alt="DOLE Logo"
                className={styles.logoImage}
              />
            </div>
          </div>

          {/* Center Content */}
          <div className={styles.centerContent}>
            <p>Republika ng Pilipinas</p>
            <p>TANGGAPAN NG SERBISYO SA PUBLIKONG EMPLEO</p>
            <p>(PUBLIC EMPLOYMENT SERVICE OFFICE – PESO)</p>
            <p>Lungsod ng Parañaque</p>
          </div>

          {/* Right Logos */}
          <div className={styles.logoContainer}>
            <div className={styles.logo}>
              <img
                src="/assets/bagongPilipinas.png"
                alt="Bagong Pilipinas Logo"
                className={styles.logoImage}
              />
            </div>
            <div className={styles.logo}>
              <img
                src="/assets/pesoLogo.png"
                alt="PESO Logo"
                className={styles.logoImage}
              />
            </div>
          </div>
        </div>

        <hr className={styles.divider} />

        {/* Date */}
        <div className={styles.dateSection}>
          <p className={styles.date}>{date}</p>
        </div>

        {/* Recipient Details */}
        <div className={styles.recipientSection}>
          <p className={styles.recipientName}>
            <EditableField
              value={recipientName}
              onChange={setRecipientName}
              fieldName="recipientName"
              className=""
              uppercase
            />
          </p>
          <p className={styles.recipientDetail}>
            <EditableField
              value={recipientTitle}
              onChange={setRecipientTitle}
              fieldName="recipientTitle"
              className=""
            />
          </p>
          <p className={styles.recipientDetail}>
            <EditableField
              value={companyName}
              onChange={setCompanyName}
              fieldName="companyName"
              className=""
            />
          </p>
          <p className={styles.recipientDetail}>
            <EditableField
              value={companyLocation}
              onChange={setCompanyLocation}
              fieldName="companyLocation"
              className=""
            />
          </p>
          <p className={styles.recipientAddress}>
            <EditableField
              value={placeOfAssignment}
              onChange={setPlaceOfAssignment}
              fieldName="placeOfAssignment"
              className=""
            />
          </p>
        </div>

        {/* Rich Text Editor for Body */}
        <div className={styles.bodySection}>
          {editingField === "bodyText" ? (
            <div className={styles.editorContainer}>
              {/* Toolbar */}
              <div className={styles.toolbar}>
                <button
                  type="button"
                  className={styles.toolbarBtn}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    formatText("bold");
                  }}
                  title="Bold (Ctrl+B)"
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  className={styles.toolbarBtn}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    formatText("italic");
                  }}
                  title="Italic (Ctrl+I)"
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  className={styles.toolbarBtn}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    formatText("underline");
                  }}
                  title="Underline (Ctrl+U)"
                >
                  <u>U</u>
                </button>
                <div className={styles.toolbarDivider}></div>
                <button
                  type="button"
                  className={styles.toolbarBtn}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    formatText("insertUnorderedList");
                  }}
                  title="Bullet List"
                >
                  ☰
                </button>
                <button
                  type="button"
                  className={styles.toolbarBtn}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    formatText("insertOrderedList");
                  }}
                  title="Numbered List"
                >
                  ≡
                </button>
                <div className={styles.toolbarDivider}></div>
                <button
                  type="button"
                  className={`${styles.toolbarBtn} ${styles.toolbarBtnSuccess}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    saveBodyContent();
                  }}
                  title="Save"
                >
                  ✓ Done
                </button>
              </div>

              {/* Editable Content - renders HTML with formatting */}
              <div
                ref={bodyEditorRef}
                className={styles.richTextEditor}
                contentEditable
                dangerouslySetInnerHTML={{ __html: bodyHTML }}
                suppressContentEditableWarning
              />
            </div>
          ) : (
            <div
              className={styles.bodyTextEditable}
              onClick={() => setEditingField("bodyText")}
              title="Click to edit"
              dangerouslySetInnerHTML={{ __html: bodyHTML }}
            />
          )}
        </div>

        {/* Signature Section */}
        <div className={styles.signature}>
          <p className={styles.signatureClosing}>Very truly yours,</p>
          <div className={styles.signatureDetails}>
            <p className={styles.signerName}>
              <EditableField
                value={signerName}
                onChange={setSignerName}
                fieldName="signerName"
                className=""
              />
            </p>
            <p className={styles.signerTitle}>
              <EditableField
                value={signerTitle}
                onChange={setSignerTitle}
                fieldName="signerTitle"
                className=""
              />
            </p>
          </div>
        </div>

        {/* Download Button */}
        {/*<div className={styles.downloadButton}>
          <Button onClick={handleDownloadPDF} variant="danger">
            DOWNLOAD PDF
          </Button>
        </div>*/}
      </div>
    );
  },
);

ReferralLetter.displayName = "ReferralLetter";

export default ReferralLetter;

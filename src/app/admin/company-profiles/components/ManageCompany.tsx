"use client";

import React, { useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import styles from "./ManageCompany.module.css";
import PostJobsModal from "./modals/PostJobsModal";
import Exam from "./exam/Exam";
import Button from "@/components/Button";
import Toast from "@/components/toast/Toast";
import { CompanyWithStats, Exam as ExamType } from "../types/company.types";

interface Job {
  id: number;
  title: string;
  description: string;
  place_of_assignment: string;
  sex: string;
  education: string;
  eligibility: string;
  posted_date: string;
  exam_id?: number | null;
  companies: {
    name: string;
    logo: string | null;
  };
}

interface Choice {
  id: number;
  question_id: number;
  choice_text: string;
  position: number;
}

interface Question {
  id: number;
  exam_id: number;
  question_text: string;
  question_type: string;
  position: number;
  choices: Choice[];
}

const ManageCompany = ({
  company,
  exam,
  onJobsUpdated,
}: {
  company: CompanyWithStats;
  exam: ExamType;
  onJobsUpdated?: () => void;
}) => {
  const [nav, setNav] = useState("createCompany");
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [jobs, setJobs] = useState(company.jobs);
  const [exams, setExams] = useState<ExamType[]>([]);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: company.name,
    contact_email: company.contact_email,
    location: company.location,
    industry: company.industry,
    description: company.description,
  });

  // Toast state
  const [toast, setToast] = useState({
    show: false,
    title: "",
    message: "",
  });

  const showToast = (title: string, message: string) => {
    setToast({ show: true, title, message });
  };

  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    },
  });

  const fetchExams = () => {
    fetch("/api/exams")
      .then((response) => response.json())
      .then((data) => setExams(data));
  };

  const refetchJobs = async () => {
    const response = await fetch(`/api/getCompaniesAdmin`);
    const data = await response.json();
    const updatedCompany = data.companies.find(
      (c: CompanyWithStats) => c.id === company.id,
    );
    if (updatedCompany) {
      setJobs(updatedCompany.jobs);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    const currentTab = tabRefs.current[activeIndex];
    if (currentTab) {
      setIndicatorStyle({
        left: currentTab.offsetLeft,
        width: currentTab.offsetWidth,
      });
    }
  }, [activeIndex]);

  const handleSaveCompany = async () => {
    setSaving(true);

    try {
      // Upload logo if changed
      if (logoFile) {
        const logoFormData = new FormData();
        logoFormData.append("logo", logoFile);
        logoFormData.append("company_id", company.id.toString());

        const logoResponse = await fetch("/api/uploadCompanyLogo", {
          method: "POST",
          body: logoFormData,
        });

        if (!logoResponse.ok) {
          throw new Error("Failed to upload logo");
        }

        const logoResult = await logoResponse.json();
        console.log("Logo uploaded:", logoResult);
      }

      // Update company details
      const response = await fetch("/api/updateCompany", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: company.id,
          ...formData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update company");
      }

      const result = await response.json();
      console.log("Company updated:", result);

      showToast("Success! 🎉", "Company profile updated successfully.");

      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error saving company:", error);
      showToast(
        "Update Failed",
        error instanceof Error ? error.message : "Failed to update company.",
      );
    } finally {
      setSaving(false);
    }
  };

  const createCompanyTab = () => {
    return (
      <div className={styles.createCompany}>
        <div className={styles.logoUpload} {...getRootProps()}>
          <input {...getInputProps()} />
          {logoPreview ? (
            <img
              src={logoPreview}
              alt="Company Logo Preview"
              className={styles.logoPreview}
            />
          ) : company.logo ? (
            <img
              src={company.logo}
              alt="Company Logo"
              className={styles.logoPreview}
            />
          ) : (
            <img src="/assets/images/default_profile.png" alt="Default Logo" />
          )}
          <div className={styles.uploadText}>
            {isDragActive
              ? "Drop the logo here..."
              : "Click or drag to upload company logo"}
          </div>
        </div>
        <div className={styles.companyDetails}>
          <div className={styles.formField}>
            <label htmlFor="edit-company-name">Company Name</label>
            <input
              id="edit-company-name"
              type="text"
              placeholder="Enter company name"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className={styles.formField}>
            <label htmlFor="edit-company-email">Contact Email</label>
            <input
              id="edit-company-email"
              type="email"
              placeholder="Enter contact email"
              required
              value={formData.contact_email}
              onChange={(e) =>
                setFormData({ ...formData, contact_email: e.target.value })
              }
            />
          </div>

          <div className={styles.formField}>
            <label htmlFor="edit-company-location">Address</label>
            <input
              id="edit-company-location"
              type="text"
              placeholder="Enter company address"
              required
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
          </div>

          <div className={styles.formField}>
            <label htmlFor="edit-company-industry">Industry</label>
            <select
              id="edit-company-industry"
              value={formData.industry}
              onChange={(e) =>
                setFormData({ ...formData, industry: e.target.value })
              }
              required
            >
              <option value="" disabled>
                Select industry
              </option>
              <option value="Agriculture">Agriculture</option>
              <option value="Automotive">Automotive</option>
              <option value="Banking & Finance">Banking & Finance</option>
              <option value="Construction">Construction</option>
              <option value="Education">Education</option>
              <option value="Energy">Energy</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Hospitality">Hospitality</option>
              <option value="Information Technology">
                Information Technology
              </option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Media & Entertainment">
                Media & Entertainment
              </option>
              <option value="Mining">Mining</option>
              <option value="Pharmaceuticals">Pharmaceuticals</option>
              <option value="Real Estate">Real Estate</option>
              <option value="Retail">Retail</option>
              <option value="Telecommunications">Telecommunications</option>
              <option value="Transportation & Logistics">
                Transportation & Logistics
              </option>
              <option value="Utilities">Utilities</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className={styles.formField}>
            <label htmlFor="edit-company-description">
              Company Description
            </label>
            <textarea
              id="edit-company-description"
              required
              placeholder="Enter company tagline or description"
              rows={5}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div style={{ marginTop: "1rem" }}>
            <Button
              variant="success"
              onClick={handleSaveCompany}
              disabled={saving}
            >
              {saving ? "SAVING..." : "SAVE CHANGES"}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const postJobsTab = () => {
    // Helper function to create an empty job object
    const createEmptyJob = (): Job => ({
      id: 0, // 0 or negative number indicates a new job
      title: "",
      description: "",
      place_of_assignment: "",
      sex: "",
      education: "",
      eligibility: "",
      posted_date: new Date().toISOString().split("T")[0], // Today's date
      exam_id: null,
      companies: {
        name: company.name,
        logo: company.logo || null,
      },
    });

    return (
      <>
        <div className={styles.postJobs}>
          {/* Add Job Button */}
          <div
            style={{
              marginBottom: "1.5rem",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="success"
              onClick={() => {
                setSelectedJob(createEmptyJob()); // Create empty job for new job
                setShowModal(true);
              }}
            >
              + ADD NEW JOB
            </Button>
          </div>

          <div className={styles.jobHeader}>
            <p>Job Title</p>
            <p>Place of Assignment</p>
            <p>Sex</p>
            <p>Education</p>
            <p>Eligibility</p>
            <p>Posted Date</p>
          </div>
          {jobs.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                color: "#666",
                fontSize: "1.1rem",
              }}
            >
              No jobs posted yet. Click &quot;Add New Job&quot; to get started.
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className={styles.jobRow}
                onClick={() => {
                  setSelectedJob({
                    id: job.id,
                    title: job.title,
                    description: "",
                    place_of_assignment: job.place_of_assignment,
                    sex: job.sex,
                    education: job.education,
                    eligibility: job.eligibility,
                    posted_date: job.posted_date,
                    exam_id: job.exam_id,
                    companies: {
                      name: company.name,
                      logo: company.logo || null,
                    },
                  });
                  setShowModal(true);
                }}
              >
                <p>{job.title}</p>
                <p>{job.place_of_assignment}</p>
                <p>{job.sex}</p>
                <p>{job.education}</p>
                <p>{job.eligibility}</p>
                <p
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: ".6rem",
                  }}
                >
                  {job.posted_date}
                  <span>
                    Edit
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                      />
                    </svg>
                  </span>
                </p>
              </div>
            ))
          )}
        </div>
        {showModal && selectedJob && (
          <PostJobsModal
            company={company}
            job={selectedJob} // Will have id: 0 for new job, or actual id for editing
            exams={exams}
            fetchExams={fetchExams}
            refetchJobs={refetchJobs}
            onClose={() => setShowModal(false)}
          />
        )}
      </>
    );
  };

  const createExamTab = () => {
    return exams ? (
      <Exam exam={exams} fetchExams={fetchExams} />
    ) : (
      <div>No pre-screening question available</div>
    );
  };

  return (
    <section className={styles.createCompanyWrapper}>
      <div className={styles.nav}>
        <ul className={styles.tabList}>
          {["createCompany", "postJobs"].map((tab, idx) => (
            <li
              key={tab}
              ref={(el) => {
                tabRefs.current[idx] = el;
              }}
              className={nav === tab ? styles.active : ""}
              onClick={() => {
                setNav(tab);
                setActiveIndex(idx);
              }}
            >
              {tab === "createCompany" && "EDIT COMPANY PROFILE"}
              {tab === "postJobs" && "POST JOBS"}
            </li>
          ))}
          <div
            className={styles.tabIndicator}
            style={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
            }}
          />
        </ul>
      </div>
      <div className={styles.content}>
        {nav === "createCompany" && createCompanyTab()}
        {nav === "postJobs" && postJobsTab()}
      </div>

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        title={toast.title}
        message={toast.message}
      />
    </section>
  );
};

export default ManageCompany;

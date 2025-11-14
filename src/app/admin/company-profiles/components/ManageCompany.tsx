"use client";

import React, { useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import styles from "./ManageCompany.module.css";

interface Companies {
  id: number;
  name: string;
  location: string;
  industry: string;
  website: string;
  logo: string;
  contact_email: string;
  description: string;
  totalManpower: number;
  jobs: {
    id: number;
    company_id: number;
    title: string;
    place_of_assignment: string;
    sex: string;
    education: string;
    eligibility: string;
    posted_date: string;
  }[];
  totalJobsPosted: number;
  totalJobsAllCompanies: number;
}

interface Job {
  id: number;
  title: string;
  description: string;
  place_of_assignment: string;
  sex: string;
  education: string;
  eligibility: string;
  posted_date: string;
  companies: {
    name: string;
    logo: string | null;
  };
}

const ManageCompany = ({ company }: { company: Companies }) => {
  const [nav, setNav] = useState("createCompany");
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [jobs, setJobs] = useState(company.jobs);
  const Logo = () => {
    setLogoPreview(company.logo);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    },
  });

  useEffect(() => {
    const currentTab = tabRefs.current[activeIndex];
    if (currentTab) {
      setIndicatorStyle({
        left: currentTab.offsetLeft,
        width: currentTab.offsetWidth,
      });
    }
  }, [activeIndex]);

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
          <input
            type="text"
            placeholder="NAME"
            required
            defaultValue={company.name}
          />
          <input
            type="tel"
            placeholder="CONTACT NUMBER"
            required
            defaultValue={company.contact_email}
          />
          <input
            type="email"
            placeholder="EMAIL"
            required
            defaultValue={company.contact_email}
          />
          <input
            type="text"
            placeholder="ADDRESS"
            required
            defaultValue={company.location}
          />
          <select defaultValue={company.industry} required>
            <option value="" disabled>
              INDUSTRY
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
            <option value="Media & Entertainment">Media & Entertainment</option>
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
          <textarea
            required
            placeholder="COMPANY TAGLINE"
            rows={5}
            defaultValue={company.description}
          />
        </div>
      </div>
    );
  };

  const postJobsTab = () => {
    return (
      <div className={styles.postJobs}>
        <div className={styles.jobHeader}>
          <p>Job Title</p>
          <p>Place of Assignment</p>
          <p>Sex</p>
          <p>Education</p>
          <p>Eligibility</p>
          <p>Posted Date</p>
        </div>
        {company.jobs.map((job) => (
          <div key={job.id} className={styles.jobRow}>
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
        ))}
      </div>
    );
  };

  const createExamTab = () => {
    return <div className={styles.createExam}>exam</div>;
  };

  return (
    <section className={styles.createCompanyWrapper}>
      <div className={styles.nav}>
        <ul className={styles.tabList}>
          {["createCompany", "postJobs", "createExam"].map((tab, idx) => (
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
              {tab === "createExam" && "CREATE EXAM"}
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
        {nav === "createExam" && createExamTab()}
      </div>
    </section>
  );
};

export default ManageCompany;

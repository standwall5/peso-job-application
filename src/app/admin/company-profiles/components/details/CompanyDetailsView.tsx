// src/app/admin/company-profiles/components/details/CompanyDetailsView.tsx

import React from "react";
import styles from "../CompanyProfiles.module.css";
import jobStyle from "@/app/(user)/job-opportunities/[companyId]/JobsOfCompany.module.css";
import { Company } from "../../types/company.types";
import BackButton from "../shared/BackButton";

interface CompanyDetailsViewProps {
  company: Company;
  onBack: () => void;
}

const CompanyDetailsView: React.FC<CompanyDetailsViewProps> = ({
  company,
  onBack,
}) => {
  return (
    <section className={styles.specificCompany}>
      <BackButton onClick={onBack} />

      <div className={styles.companyDetails}>
        <div className={styles.companyLogoDiv}>
          <span>
            Manpower Needed: <br />
            <span>{company.totalManpower}</span>
          </span>
          <img
            src={company.logo || "/assets/images/default_profile.png"}
            alt={company.name}
          />
          <span>
            Job Vacancies: <br />
            <span>{company.totalJobsPosted}</span>
          </span>
        </div>
        <h2>
          <strong>{company.name}</strong>
        </h2>
        <span>{company.location}</span>
        <span>{company.description}</span>
      </div>

      <div className={styles.jobsPosted}>
        <h2>Jobs Posted</h2>
        {company.jobs.length > 0 ? (
          company.jobs.map((job) => (
            <div
              key={job.id}
              className={jobStyle.jobListItem}
              style={{
                border: "1px solid #e0e0e0",
                padding: "1.5rem",
                marginBottom: "1rem",
                borderRadius: "8px",
                background: "#fff",
                display: "flex",
                gap: "1rem",
                alignItems: "flex-start",
                boxShadow: "rgba(0, 0, 0, 0.1) 0px 2px 4px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "rgba(0, 0, 0, 0.15) 0px 4px 8px";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "rgba(0, 0, 0, 0.1) 0px 2px 4px";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  minWidth: "80px",
                }}
              >
                {company.logo && (
                  <img
                    src={company.logo || "/assets/images/default_profile.png"}
                    alt={company.name + " logo"}
                    style={{
                      width: "64px",
                      height: "64px",
                      objectFit: "contain",
                      borderRadius: "8px",
                    }}
                  />
                )}
              </div>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <h3 style={{ margin: 0, color: "#333", fontSize: "1.2rem" }}>
                  {job.title}
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "0.5rem",
                    fontSize: "0.95rem",
                    color: "#666",
                  }}
                >
                  <p style={{ margin: 0 }}>
                    <strong>Location:</strong> {job.place_of_assignment}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Gender:</strong> {job.sex}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Education:</strong> {job.education}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Eligibility:</strong> {job.eligibility}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Posted:</strong>{" "}
                    {new Date(job.posted_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "#666",
              fontSize: "1.1rem",
            }}
          >
            No jobs posted yet
          </div>
        )}
      </div>
    </section>
  );
};

export default CompanyDetailsView;

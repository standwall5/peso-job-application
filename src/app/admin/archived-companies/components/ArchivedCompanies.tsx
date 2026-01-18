"use client";

import React, { useState, useEffect } from "react";
import styles from "@/app/admin/company-profiles/components/CompanyProfiles.module.css";
import OneEightyRing from "@/components/OneEightyRing";
import Button from "@/components/Button";

interface Company {
  id: number;
  name: string;
  logo: string | null;
  industry: string;
  email: string;
  phone: string;
  is_archived: boolean;
  created_at: string;
}

const ArchivedCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCompanies, setSelectedCompanies] = useState<number[]>([]);

  useEffect(() => {
    fetchArchivedCompanies();
  }, []);

  const fetchArchivedCompanies = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/companies?archived=true");
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies || []);
      }
    } catch (error) {
      console.error("Error fetching archived companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnarchiveSelected = async () => {
    if (selectedCompanies.length === 0) return;

    if (
      !confirm(
        `Are you sure you want to unarchive ${selectedCompanies.length} company(ies)?`,
      )
    ) {
      return;
    }

    try {
      for (const companyId of selectedCompanies) {
        await fetch("/api/admin/archive-company", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            companyId: companyId,
            isArchived: false,
          }),
        });
      }
      setSelectedCompanies([]);
      alert("Selected companies unarchived successfully!");
      fetchArchivedCompanies();
    } catch (error) {
      console.error("Error unarchiving companies:", error);
      alert("Failed to unarchive some companies. Please try again.");
    }
  };

  const handleSelectAll = () => {
    if (selectedCompanies.length === filteredCompanies.length) {
      setSelectedCompanies([]);
    } else {
      setSelectedCompanies(filteredCompanies.map((c) => c.id));
    }
  };

  const handleToggleSelect = (companyId: number) => {
    setSelectedCompanies((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId],
    );
  };

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <section className={styles.companies}>
        <div className={styles.loadingContainer}>
          <OneEightyRing />
          <p>Loading archived companies...</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.companies}>
      <div className={styles.top}>
        <div className={styles.header}>
          <h1>Archived Companies</h1>
          <p className={styles.subtitle}>
            {filteredCompanies.length} archived{" "}
            {filteredCompanies.length === 1 ? "company" : "companies"}
          </p>
        </div>

        <div className={styles.controls}>
          <input
            type="text"
            placeholder="Search archived companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <div className={styles.actions}>
            {selectedCompanies.length > 0 && (
              <>
                <Button variant="primary" onClick={handleSelectAll}>
                  {selectedCompanies.length === filteredCompanies.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
                <Button variant="success" onClick={handleUnarchiveSelected}>
                  Unarchive Selected ({selectedCompanies.length})
                </Button>
              </>
            )}
            <Button
              variant="primary"
              onClick={() => (window.location.href = "/admin/company-profiles")}
            >
              ← Back to Active Companies
            </Button>
          </div>
        </div>
      </div>

      {filteredCompanies.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h3>No archived companies</h3>
          <p>Archived companies will appear here</p>
        </div>
      ) : (
        <div className={styles.companiesGrid}>
          {filteredCompanies.map((company) => (
            <div
              key={company.id}
              className={`${styles.companyCard} ${
                selectedCompanies.includes(company.id) ? styles.selected : ""
              }`}
            >
              <div className={styles.selectCheckbox}>
                <input
                  type="checkbox"
                  checked={selectedCompanies.includes(company.id)}
                  onChange={() => handleToggleSelect(company.id)}
                />
              </div>
              <div className={styles.companyLogo}>
                {company.logo ? (
                  <img src={company.logo} alt={company.name} />
                ) : (
                  <div className={styles.logoPlaceholder}>
                    {company.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className={styles.companyInfo}>
                <h3>{company.name}</h3>
                <p className={styles.industry}>{company.industry}</p>
                <p className={styles.contact}>
                  {company.email && (
                    <span>
                      ✉️ {company.email}
                      <br />
                    </span>
                  )}
                  {company.phone && <span>📞 {company.phone}</span>}
                </p>
              </div>
              <div className={styles.archivedBadge}>
                <span>🗄️ Archived</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ArchivedCompanies;

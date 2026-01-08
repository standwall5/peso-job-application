// src/app/admin/reports/components/ExportButton.tsx
"use client";

import React, { useState } from "react";
import styles from "./Reports.module.css";

interface ExportButtonProps {
  onExport: (format: "xlsx" | "csv" | "pdf") => void;
  disabled?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  onExport,
  disabled = false,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleExport = (format: "xlsx" | "csv" | "pdf") => {
    onExport(format);
    setShowDropdown(false);
  };

  return (
    <div className={styles.exportButtonContainer}>
      <button
        className={styles.exportButton}
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={disabled}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          style={{ width: "1.25rem", height: "1.25rem" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
        Export
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          style={{
            width: "0.875rem",
            height: "0.875rem",
            transform: showDropdown ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>

      {showDropdown && (
        <>
          <div
            className={styles.exportDropdownOverlay}
            onClick={() => setShowDropdown(false)}
          />
          <div className={styles.exportDropdown}>
            <button
              className={styles.exportOption}
              onClick={() => handleExport("xlsx")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                style={{ width: "1.25rem", height: "1.25rem", color: "#217346" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>
              <div>
                <div className={styles.exportOptionTitle}>Excel (.xlsx)</div>
                <div className={styles.exportOptionDesc}>
                  Full data with formatting
                </div>
              </div>
            </button>

            <button
              className={styles.exportOption}
              onClick={() => handleExport("csv")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                style={{ width: "1.25rem", height: "1.25rem", color: "#666" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>
              <div>
                <div className={styles.exportOptionTitle}>CSV (.csv)</div>
                <div className={styles.exportOptionDesc}>
                  Plain data for spreadsheets
                </div>
              </div>
            </button>

            <button
              className={styles.exportOption}
              onClick={() => handleExport("pdf")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                style={{ width: "1.25rem", height: "1.25rem", color: "#DC3545" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>
              <div>
                <div className={styles.exportOptionTitle}>PDF (.pdf)</div>
                <div className={styles.exportOptionDesc}>
                  Print-ready report
                </div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButton;

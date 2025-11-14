"use client";

import React, { useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import styles from "./CreateCompany.module.css";

const CreateCompany = () => {
  const [nav, setNav] = useState("createCompany");
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

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
          <input type="text" placeholder="NAME" required />
          <input type="tel" placeholder="CONTACT NUMBER" required />
          <input type="email" placeholder="EMAIL" required />
          <input type="text" placeholder="ADDRESS" required />
          <select defaultValue="" required>
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
          <textarea required placeholder="COMPANY TAGLINE" rows={5} />
        </div>
      </div>
    );
  };

  const postJobs = () => {
    return <div className={styles.postJobs}></div>;
  };

  return (
    <section className={styles.createCompanyWrapper}>
      <div className={styles.nav}>
        <ul className={styles.tabList}>
          {["createCompany"].map((tab, idx) => (
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
              {tab === "createCompany" && "CREATE COMPANY PROFILE"}
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
      </div>
    </section>
  );
};

export default CreateCompany;

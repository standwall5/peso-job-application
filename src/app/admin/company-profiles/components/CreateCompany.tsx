"use client";

import React, { useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Button from "@/components/Button";
import styles from "./CreateCompany.module.css";

const CreateCompany = () => {
  const [nav, setNav] = useState("createCompany");
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    contact_email: "",
    location: "",
    industry: "",
    description: "",
  });

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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Validate required fields
    if (
      !formData.name ||
      !formData.contact_email ||
      !formData.location ||
      !formData.industry
    ) {
      alert(
        "Please fill in all required fields (Name, Email, Location, and Industry)",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Create the company
      const createResponse = await fetch("/api/createCompany", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const createResult = await createResponse.json();

      if (!createResponse.ok) {
        throw new Error(createResult.error || "Failed to create company");
      }

      const newCompany = createResult.data;

      // Step 2: Upload logo if provided
      if (logoFile && newCompany.id) {
        const logoFormData = new FormData();
        logoFormData.append("logo", logoFile);
        logoFormData.append("company_id", newCompany.id.toString());

        const logoResponse = await fetch("/api/uploadCompanyLogo", {
          method: "POST",
          body: logoFormData,
        });

        const logoResult = await logoResponse.json();

        if (!logoResponse.ok) {
          console.error("Logo upload failed:", logoResult.error);
          // Don't throw error, company is already created
          alert(
            `Company created successfully, but logo upload failed: ${logoResult.error}`,
          );
        } else {
          alert("Company profile created successfully with logo!");
        }
      } else {
        alert("Company profile created successfully!");
      }

      // Reset form
      setFormData({
        name: "",
        contact_email: "",
        location: "",
        industry: "",
        description: "",
      });
      setLogoFile(null);
      setLogoPreview(null);

      // Optionally reload the page or redirect
      window.location.reload();
    } catch (error) {
      console.error("Error creating company:", error);
      alert(
        error instanceof Error ? error.message : "Failed to create company",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const createCompanyTab = () => {
    return (
      <form className={styles.createCompany} onSubmit={handleSubmit}>
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
          <input
            type="text"
            name="name"
            placeholder="NAME"
            value={formData.name}
            onChange={handleInputChange}
            required
          />

          <input
            type="email"
            name="contact_email"
            placeholder="EMAIL"
            value={formData.contact_email}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="location"
            placeholder="ADDRESS"
            value={formData.location}
            onChange={handleInputChange}
            required
          />
          <select
            name="industry"
            value={formData.industry}
            onChange={handleInputChange}
            required
          >
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
            name="description"
            placeholder="COMPANY TAGLINE"
            value={formData.description}
            onChange={handleInputChange}
            rows={5}
          />
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "CREATING..." : "CREATE COMPANY"}
          </Button>
        </div>
      </form>
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

"use client";
import React, { useState, useEffect } from "react";
import NextImage from "next/image";
import styles from "./RecommendedJobsPanel.module.css";
import { calculateSkillMatch } from "@/lib/utils/skillMatching";
import SkillMatchBadge from "@/components/SkillMatchBadge";
import { Job } from "../[companyId]/types/job.types";
import { useLanguage } from "@/contexts/LanguageContext";

interface Company {
  id: number;
  name: string;
  logo: string | null;
  jobCount: number;
  totalMatchPercentage: number;
  averageMatchPercentage: number;
}

// Function to get dominant color from image
const getDominantColor = (imageSrc: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageSrc;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve("#3498db"); // fallback color
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Simple dominant color calculation (average of all pixels)
      let r = 0,
        g = 0,
        b = 0;
      const pixelCount = data.length / 4;

      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }

      r = Math.round(r / pixelCount);
      g = Math.round(g / pixelCount);
      b = Math.round(b / pixelCount);

      resolve(`rgb(${r}, ${g}, ${b})`);
    };

    img.onerror = () => {
      resolve("#3498db"); // fallback color
    };
  });
};

// Function to make colors more vibrant by increasing saturation
const makeVibrant = (color: string): string => {
  // Extract RGB values
  const match = color.match(/\d+/g);
  if (!match || match.length < 3) return color;

  let r = parseInt(match[0]);
  let g = parseInt(match[1]);
  let b = parseInt(match[2]);

  // Convert RGB to HSL
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  // Boost saturation (make it more vibrant)
  s = Math.min(1, s * 2.0); // Increase saturation by 100%

  // Adjust lightness to be in a pleasant range (not too dark, not too light)
  if (l < 0.35) l = 0.45; // Lighten if too dark
  if (l > 0.65) l = 0.55; // Darken if too light

  // Convert HSL back to RGB
  let r2, g2, b2;

  if (s === 0) {
    r2 = g2 = b2 = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r2 = hue2rgb(p, q, h + 1 / 3);
    g2 = hue2rgb(p, q, h);
    b2 = hue2rgb(p, q, h - 1 / 3);
  }

  r2 = Math.round(r2 * 255);
  g2 = Math.round(g2 * 255);
  b2 = Math.round(b2 * 255);

  return `rgb(${r2}, ${g2}, ${b2})`;
};

// Function to calculate luminance and return appropriate text color
const getTextColor = (bgColor: string): string => {
  // Extract RGB values from rgb() or rgba() string
  const match = bgColor.match(/\d+/g);
  if (!match || match.length < 3) return "#ffffff";

  const r = parseInt(match[0]);
  const g = parseInt(match[1]);
  const b = parseInt(match[2]);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return white for dark backgrounds, dark for light backgrounds
  return luminance > 0.5 ? "#1e293b" : "#ffffff";
};

interface RecommendedJobsPanelProps {
  jobs: Job[];
  userSkills: string[];
  userPreferredLocation?: string | null;
}

const RecommendedJobsPanel: React.FC<RecommendedJobsPanelProps> = ({
  jobs,
  userSkills,
  userPreferredLocation,
}) => {
  const { t } = useLanguage();
  const [companyColors, setCompanyColors] = useState<
    Record<number, { bg: string; text: string }>
  >({});

  // Group jobs by company and calculate match percentages
  const recommendedCompanies = React.useMemo(() => {
    const companyMap = new Map<
      number,
      Company & { locationMatchCount: number }
    >();

    jobs.forEach((job) => {
      if (!job.companies || !job.company_id) return;

      const matchPercentage = calculateSkillMatch(userSkills, job.skills || []);

      // Check if job location matches user's preferred location
      const isLocationMatch = userPreferredLocation
        ? (() => {
            const jobLocation = job.place_of_assignment?.toLowerCase() || "";
            const preferredLocation = userPreferredLocation.toLowerCase();
            return (
              jobLocation.includes(preferredLocation) ||
              preferredLocation.includes(jobLocation)
            );
          })()
        : false;

      if (matchPercentage > 0) {
        const companyId = job.company_id;
        const existing = companyMap.get(companyId);

        if (existing) {
          existing.jobCount += 1;
          existing.totalMatchPercentage += matchPercentage;
          existing.averageMatchPercentage =
            existing.totalMatchPercentage / existing.jobCount;
          if (isLocationMatch) {
            existing.locationMatchCount += 1;
          }
        } else {
          companyMap.set(companyId, {
            id: companyId,
            name: job.companies.name,
            logo: job.companies.logo,
            jobCount: 1,
            totalMatchPercentage: matchPercentage,
            averageMatchPercentage: matchPercentage,
            locationMatchCount: isLocationMatch ? 1 : 0,
          });
        }
      }
    });

    return Array.from(companyMap.values())
      .sort((a, b) => {
        // First sort by location match count (descending)
        if (userPreferredLocation) {
          const locationDiff = b.locationMatchCount - a.locationMatchCount;
          if (locationDiff !== 0) return locationDiff;
        }
        // Then sort by skill match percentage (descending)
        return b.averageMatchPercentage - a.averageMatchPercentage;
      })
      .slice(0, 5);
  }, [jobs, userSkills, userPreferredLocation]);

  const displayedCompanies = recommendedCompanies;

  // Extract dominant colors for each company
  useEffect(() => {
    const extractColors = async () => {
      const colors: Record<number, { bg: string; text: string }> = {};

      for (const company of displayedCompanies) {
        const imageSrc = company.logo || "/assets/images/default_profile.png";
        try {
          const dominantColor = await getDominantColor(imageSrc);
          const vibrantColor = makeVibrant(dominantColor);
          const textColor = getTextColor(vibrantColor);
          colors[company.id] = { bg: vibrantColor, text: textColor };
        } catch (error) {
          console.error("Error extracting color:", error);
          colors[company.id] = { bg: "#3498db", text: "#ffffff" };
        }
      }

      setCompanyColors(colors);
    };

    if (displayedCompanies.length > 0) {
      extractColors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayedCompanies.length, jobs.length]);

  if (recommendedCompanies.length === 0) {
    return (
      <div className={styles.panel}>
        <h3 className={styles.title}>{t("jobs.recommendedForYou")}</h3>
        <p className={styles.noJobs}>
          {userSkills.length === 0
            ? t("jobs.addSkillsForRecommendations")
            : t("jobs.noMatchingJobs")}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          {t("jobs.recommendedForYou")}
          <span className={styles.count}>({recommendedCompanies.length})</span>
        </h3>
      </div>

      <div className={styles.jobsList}>
        {displayedCompanies.map((company) => {
          const colors = companyColors[company.id] || {
            bg: "#f8f9fa",
            text: "#1e293b",
          };

          return (
            <a
              key={company.id}
              href={`/job-opportunities/${company.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                className={styles.jobItem}
                style={{
                  cursor: "pointer",
                  backgroundColor: colors.bg,
                  color: colors.text,
                  transition: "all 0.3s ease",
                }}
              >
                <div className={styles.jobHeader}>
                  <NextImage
                    src={company.logo || "/assets/images/default_profile.png"}
                    alt={company.name || "Company"}
                    className={styles.companyLogo}
                    width={48}
                    height={48}
                  />
                  <div className={styles.jobInfo}>
                    <h4 className={styles.jobTitle}>{company.name}</h4>
                    <p className={styles.companyName}>
                      {company.jobCount}{" "}
                      {company.jobCount === 1 ? "Job" : "Jobs"} Available
                    </p>
                  </div>
                </div>
                <SkillMatchBadge
                  percentage={Math.round(company.averageMatchPercentage)}
                  size="small"
                />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendedJobsPanel;

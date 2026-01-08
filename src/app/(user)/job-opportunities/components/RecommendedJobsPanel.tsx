"use client";
import React, { useState, useEffect } from "react";
import styles from "./RecommendedJobsPanel.module.css";
import { calculateSkillMatch } from "@/lib/utils/skillMatching";
import SkillMatchBadge from "@/components/SkillMatchBadge";
import { Job } from "../[companyId]/types/job.types";
import { useLanguage } from "@/contexts/LanguageContext";

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
  onJobClick?: (job: Job) => void;
}

const RecommendedJobsPanel: React.FC<RecommendedJobsPanelProps> = ({
  jobs,
  userSkills,
  onJobClick,
}) => {
  const { t } = useLanguage();
  const [jobColors, setJobColors] = useState<
    Record<number, { bg: string; text: string }>
  >({});

  const recommendedJobs = jobs
    .map((job) => ({
      ...job,
      matchPercentage: calculateSkillMatch(userSkills, job.skills || []),
    }))
    .filter((job) => job.matchPercentage > 0)
    .sort((a, b) => b.matchPercentage - a.matchPercentage);

  // Show 4-5 jobs by default (no expansion)
  const displayedJobs = recommendedJobs.slice(0, 5);

  // Extract dominant colors for each job
  useEffect(() => {
    const extractColors = async () => {
      const colors: Record<number, { bg: string; text: string }> = {};

      for (const job of displayedJobs) {
        const imageSrc =
          job.companies?.logo || "/assets/images/default_profile.png";
        try {
          const dominantColor = await getDominantColor(imageSrc);
          const vibrantColor = makeVibrant(dominantColor);
          const textColor = getTextColor(vibrantColor);
          colors[job.id] = { bg: vibrantColor, text: textColor };
        } catch (error) {
          console.error("Error extracting color:", error);
          colors[job.id] = { bg: "#3498db", text: "#ffffff" };
        }
      }

      setJobColors(colors);
    };

    if (displayedJobs.length > 0) {
      extractColors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayedJobs.length, jobs.length]);

  if (recommendedJobs.length === 0) {
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
          <span className={styles.count}>({recommendedJobs.length})</span>
        </h3>
      </div>

      <div className={styles.jobsList}>
        {displayedJobs.map((job) => {
          const colors = jobColors[job.id] || {
            bg: "#f8f9fa",
            text: "#1e293b",
          };

          return (
            <div
              key={job.id}
              className={styles.jobItem}
              onClick={() => onJobClick?.(job)}
              style={{
                cursor: "pointer",
                backgroundColor: colors.bg,
                color: colors.text,
                transition: "all 0.3s ease",
              }}
            >
              <div className={styles.jobHeader}>
                <img
                  src={
                    job.companies?.logo || "/assets/images/default_profile.png"
                  }
                  alt={job.companies?.name || "Company"}
                  className={styles.companyLogo}
                />
                <div className={styles.jobInfo}>
                  <h4 className={styles.jobTitle}>{job.title}</h4>
                  <p className={styles.companyName}>{job.companies?.name}</p>
                  <p className={styles.location}>{job.place_of_assignment}</p>
                </div>
              </div>
              <SkillMatchBadge percentage={job.matchPercentage} size="small" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendedJobsPanel;

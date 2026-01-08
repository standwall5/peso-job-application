"use client";

import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import styles from "./LanguageSelector.module.css";

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (lang: "en" | "tl") => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className={styles.languageSelector}>
      <button
        className={styles.languageButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select language"
      >
        Select Language
        <span className={`${styles.arrow} ${isOpen ? styles.open : ""}`}>
          ^
        </span>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <button
            className={`${styles.languageOption} ${language === "en" ? styles.active : ""}`}
            onClick={() => handleLanguageChange("en")}
          >
            English
          </button>
          <button
            className={`${styles.languageOption} ${language === "tl" ? styles.active : ""}`}
            onClick={() => handleLanguageChange("tl")}
          >
            Tagalog
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;

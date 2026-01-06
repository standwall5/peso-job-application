"use client";
import React, { useState, useRef, useEffect } from "react";
import styles from "./SkillsAutocomplete.module.css";
import { SKILLS_DATABASE, searchSkills } from "@/lib/data/skills";

interface SkillsAutocompleteProps {
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
  placeholder?: string;
}

export const SkillsAutocomplete: React.FC<SkillsAutocompleteProps> = ({
  selectedSkills,
  onSkillsChange,
  placeholder = "Add skills...",
}) => {
  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredSkills, setFilteredSkills] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputValue.trim()) {
      const results = searchSkills(inputValue);
      // Filter out already selected skills
      const available = results.filter(
        (skill) =>
          !selectedSkills.some(
            (selected) => selected.toLowerCase() === skill.toLowerCase()
          )
      );
      setFilteredSkills(available);
      setShowDropdown(available.length > 0);
    } else {
      setFilteredSkills([]);
      setShowDropdown(false);
    }
    setHighlightedIndex(-1);
  }, [inputValue, selectedSkills]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (
      trimmedSkill &&
      !selectedSkills.some(
        (s) => s.toLowerCase() === trimmedSkill.toLowerCase()
      )
    ) {
      onSkillsChange([...selectedSkills, trimmedSkill]);
      setInputValue("");
      setShowDropdown(false);
      inputRef.current?.focus();
    }
  };

  const removeSkill = (index: number) => {
    onSkillsChange(selectedSkills.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredSkills[highlightedIndex]) {
        addSkill(filteredSkills[highlightedIndex]);
      } else if (inputValue.trim()) {
        // Allow custom skills if not in dropdown
        addSkill(inputValue);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredSkills.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setHighlightedIndex(-1);
    } else if (e.key === "Backspace" && !inputValue && selectedSkills.length > 0) {
      // Remove last skill when backspace on empty input
      removeSkill(selectedSkills.length - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className={styles.container}>
      <div className={styles.skillsWrapper}>
        {/* Selected Skills Tags */}
        <div className={styles.skillsTags}>
          {selectedSkills.map((skill, index) => (
            <span key={index} className={styles.skillTag}>
              {skill}
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => removeSkill(index)}
                aria-label={`Remove ${skill}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {/* Input Field */}
        <div className={styles.inputWrapper}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (inputValue.trim() && filteredSkills.length > 0) {
                setShowDropdown(true);
              }
            }}
            placeholder={selectedSkills.length === 0 ? placeholder : ""}
            className={styles.input}
            autoComplete="off"
          />

          {/* Dropdown */}
          {showDropdown && filteredSkills.length > 0 && (
            <div ref={dropdownRef} className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <span className={styles.dropdownTitle}>Suggested Skills</span>
                <span className={styles.dropdownHint}>
                  Press Enter or click to add
                </span>
              </div>
              <ul className={styles.dropdownList}>
                {filteredSkills.map((skill, index) => (
                  <li
                    key={index}
                    className={`${styles.dropdownItem} ${
                      index === highlightedIndex ? styles.highlighted : ""
                    }`}
                    onClick={() => addSkill(skill)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <svg
                      className={styles.itemIcon}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Helper Text */}
      <p className={styles.helperText}>
        Type to search from {SKILLS_DATABASE.length}+ skills or add your own.
        Press Enter to add.
      </p>
    </div>
  );
};

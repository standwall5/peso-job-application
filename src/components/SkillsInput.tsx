import React, { useState, useRef, useEffect } from "react";
import { searchSkills, isValidSkill } from "@/lib/data/skills";
import styles from "./SkillsInput.module.css";

interface SkillsInputProps {
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export default function SkillsInput({
  skills,
  onSkillsChange,
  placeholder = "Type to search skills...",
  label = "Skills",
  required = false,
}: SkillsInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.trim()) {
      const results = searchSkills(value);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle skill selection
  const handleSelectSkill = (skill: string) => {
    if (!skills.includes(skill)) {
      onSkillsChange([...skills, skill]);
    }
    setInputValue("");
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();

      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSelectSkill(suggestions[selectedIndex]);
      } else if (inputValue.trim() && isValidSkill(inputValue.trim())) {
        handleSelectSkill(inputValue.trim());
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  // Handle remove skill
  const handleRemoveSkill = (skillToRemove: string) => {
    onSkillsChange(skills.filter((s) => s !== skillToRemove));
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.skillsInputContainer}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>

      {/* Skills Tags */}
      <div className={styles.skillsTags}>
        {skills.map((skill, index) => (
          <span key={index} className={styles.skillTag}>
            {skill}
            <button
              type="button"
              onClick={() => handleRemoveSkill(skill)}
              className={styles.removeButton}
              aria-label={`Remove ${skill}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* Input with Autocomplete */}
      <div className={styles.inputWrapper}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className={styles.input}
          autoComplete="off"
        />

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div ref={suggestionsRef} className={styles.suggestions}>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`${styles.suggestionItem} ${
                  index === selectedIndex ? styles.selected : ""
                }`}
                onClick={() => handleSelectSkill(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>

      <p className={styles.hint}>
        Start typing to search from our skills database. Select from dropdown or
        press Enter.
      </p>
    </div>
  );
}

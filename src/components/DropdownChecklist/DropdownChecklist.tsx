// src/components/DropdownChecklist/DropdownChecklist.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./DropdownChecklist.module.css";

interface DropdownChecklistProps {
  options: readonly string[];
  selectedValues: string[];
  onChange: (type: string, checked: boolean) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
}

export const DropdownChecklist: React.FC<DropdownChecklistProps> = ({
  options,
  selectedValues,
  onChange,
  placeholder = "Select options",
  label,
  required = false,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter(
    (option) =>
      option.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedValues.includes(option),
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAddItem = (item: string) => {
    onChange(item, true);
    setSearchTerm("");
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleRemoveItem = (item: string) => {
    onChange(item, false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
        handleAddItem(filteredOptions[highlightedIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
      setHighlightedIndex(-1);
    } else if (
      e.key === "Backspace" &&
      !searchTerm &&
      selectedValues.length > 0
    ) {
      // Remove last item when backspace on empty input
      handleRemoveItem(selectedValues[selectedValues.length - 1]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  return (
    <div className={styles.dropdownContainer} ref={dropdownRef}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}> *</span>}
        </label>
      )}

      <div
        className={`${styles.tagsWrapper} ${error ? styles.errorBorder : ""} ${isOpen ? styles.focused : ""}`}
      >
        {/* Selected Items as Tags */}
        <div className={styles.tagsList}>
          {selectedValues.map((item) => (
            <span key={item} className={styles.tag}>
              {item}
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => handleRemoveItem(item)}
                aria-label={`Remove ${item}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          placeholder={selectedValues.length === 0 ? placeholder : ""}
          className={styles.input}
          autoComplete="off"
        />
      </div>

      {/* Dropdown List */}
      {isOpen && filteredOptions.length > 0 && (
        <div className={styles.dropdownList}>
          <div className={styles.dropdownHeader}>
            <span className={styles.dropdownTitle}>Available Options</span>
            <span className={styles.dropdownHint}>
              Click or press Enter to add
            </span>
          </div>
          <ul className={styles.optionsList}>
            {filteredOptions.map((option, index) => (
              <li
                key={option}
                className={`${styles.optionItem} ${
                  index === highlightedIndex ? styles.highlighted : ""
                }`}
                onClick={() => handleAddItem(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <svg
                  className={styles.itemIcon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>{option}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};

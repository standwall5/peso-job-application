import React from "react";
import styles from "../ReferralLetter.module.css";

interface EditableFieldProps {
  value: string;
  onChange: (val: string) => void;
  fieldName: string;
  className: string;
  editingField: string | null;
  setEditingField: (field: string | null) => void;
  multiline?: boolean;
  uppercase?: boolean;
  rows?: number;
}

export default function EditableField({
  value,
  onChange,
  fieldName,
  className,
  editingField,
  setEditingField,
  multiline = false,
  uppercase = false,
  rows = 1,
}: EditableFieldProps) {
  const isEditing = editingField === fieldName;
  const displayValue = uppercase ? value.toUpperCase() : value;

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          className={`${className} ${styles.editableInput}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setEditingField(null)}
          autoFocus
          rows={rows}
        />
      );
    }
    return (
      <input
        type="text"
        className={`${className} ${styles.editableInput}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditingField(null)}
        autoFocus
      />
    );
  }

  return (
    <span
      className={`${className} ${styles.editable}`}
      onClick={() => setEditingField(fieldName)}
      title="Click to edit"
    >
      {displayValue}
    </span>
  );
}

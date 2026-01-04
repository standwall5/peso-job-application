import React from "react";
import styles from "../ReferralLetter.module.css";

interface RichTextToolbarProps {
  onFormat: (command: string) => void;
  onSave: () => void;
}

export default function RichTextToolbar({
  onFormat,
  onSave,
}: RichTextToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <button
        type="button"
        className={styles.toolbarBtn}
        onMouseDown={(e) => {
          e.preventDefault();
          onFormat("bold");
        }}
        title="Bold (Ctrl+B)"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        className={styles.toolbarBtn}
        onMouseDown={(e) => {
          e.preventDefault();
          onFormat("italic");
        }}
        title="Italic (Ctrl+I)"
      >
        <em>I</em>
      </button>
      <button
        type="button"
        className={styles.toolbarBtn}
        onMouseDown={(e) => {
          e.preventDefault();
          onFormat("underline");
        }}
        title="Underline (Ctrl+U)"
      >
        <u>U</u>
      </button>
      <div className={styles.toolbarDivider}></div>
      <button
        type="button"
        className={styles.toolbarBtn}
        onMouseDown={(e) => {
          e.preventDefault();
          onFormat("insertUnorderedList");
        }}
        title="Bullet List"
      >
        ☰
      </button>
      <button
        type="button"
        className={styles.toolbarBtn}
        onMouseDown={(e) => {
          e.preventDefault();
          onFormat("insertOrderedList");
        }}
        title="Numbered List"
      >
        ≡
      </button>
      <div className={styles.toolbarDivider}></div>
      <button
        type="button"
        className={`${styles.toolbarBtn} ${styles.toolbarBtnSuccess}`}
        onMouseDown={(e) => {
          e.preventDefault();
          onSave();
        }}
        title="Save"
      >
        ✓ Done
      </button>
    </div>
  );
}

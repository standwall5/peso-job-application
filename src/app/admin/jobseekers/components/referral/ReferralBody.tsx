import React, { RefObject } from "react";
import styles from "../ReferralLetter.module.css";
import RichTextToolbar from "./RichTextToolbar";

interface ReferralBodyProps {
  bodyHTML: string;
  editingField: string | null;
  setEditingField: (field: string | null) => void;
  bodyEditorRef: RefObject<HTMLDivElement | null>;
  onSave: () => void;
}

export default function ReferralBody({
  bodyHTML,
  editingField,
  setEditingField,
  bodyEditorRef,
  onSave,
}: ReferralBodyProps) {
  const formatText = (command: string) => {
    document.execCommand(command, false, undefined);
    bodyEditorRef.current?.focus();
  };

  return (
    <div className={styles.bodySection}>
      {editingField === "bodyText" ? (
        <div className={styles.editorContainer}>
          {/* Toolbar */}
          <RichTextToolbar onFormat={formatText} onSave={onSave} />

          {/* Editable Content - renders HTML with formatting */}
          <div
            ref={bodyEditorRef}
            className={styles.richTextEditor}
            contentEditable
            dangerouslySetInnerHTML={{ __html: bodyHTML }}
            suppressContentEditableWarning
          />
        </div>
      ) : (
        <div
          className={styles.bodyTextEditable}
          onClick={() => setEditingField("bodyText")}
          title="Click to edit"
          dangerouslySetInnerHTML={{ __html: bodyHTML }}
        />
      )}
    </div>
  );
}

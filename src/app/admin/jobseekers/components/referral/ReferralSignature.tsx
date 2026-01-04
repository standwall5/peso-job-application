import React from "react";
import styles from "../ReferralLetter.module.css";
import EditableField from "./EditableField";

interface ReferralSignatureProps {
  signerName: string;
  setSignerName: (val: string) => void;
  signerTitle: string;
  setSignerTitle: (val: string) => void;
  editingField: string | null;
  setEditingField: (field: string | null) => void;
}

export default function ReferralSignature({
  signerName,
  setSignerName,
  signerTitle,
  setSignerTitle,
  editingField,
  setEditingField,
}: ReferralSignatureProps) {
  return (
    <div className={styles.signature}>
      <p className={styles.signatureClosing}>Very truly yours,</p>
      <div className={styles.signatureDetails}>
        <p className={styles.signerName}>
          <EditableField
            value={signerName}
            onChange={setSignerName}
            fieldName="signerName"
            className=""
            editingField={editingField}
            setEditingField={setEditingField}
          />
        </p>
        <p className={styles.signerTitle}>
          <EditableField
            value={signerTitle}
            onChange={setSignerTitle}
            fieldName="signerTitle"
            className=""
            editingField={editingField}
            setEditingField={setEditingField}
          />
        </p>
      </div>
    </div>
  );
}

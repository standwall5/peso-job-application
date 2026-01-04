import React from "react";
import styles from "../ReferralLetter.module.css";
import EditableField from "./EditableField";

interface ReferralRecipientProps {
  date: string;
  recipientName: string;
  setRecipientName: (val: string) => void;
  recipientTitle: string;
  setRecipientTitle: (val: string) => void;
  companyName: string;
  setCompanyName: (val: string) => void;
  companyLocation: string;
  setCompanyLocation: (val: string) => void;
  placeOfAssignment: string;
  setPlaceOfAssignment: (val: string) => void;
  editingField: string | null;
  setEditingField: (field: string | null) => void;
}

export default function ReferralRecipient({
  date,
  recipientName,
  setRecipientName,
  recipientTitle,
  setRecipientTitle,
  companyName,
  setCompanyName,
  companyLocation,
  setCompanyLocation,
  placeOfAssignment,
  setPlaceOfAssignment,
  editingField,
  setEditingField,
}: ReferralRecipientProps) {
  return (
    <>
      {/* Date */}
      <div className={styles.dateSection}>
        <p className={styles.date}>{date}</p>
      </div>

      {/* Recipient Details */}
      <div className={styles.recipientSection}>
        <p className={styles.recipientName}>
          <EditableField
            value={recipientName}
            onChange={setRecipientName}
            fieldName="recipientName"
            className=""
            editingField={editingField}
            setEditingField={setEditingField}
            uppercase
          />
        </p>
        <p className={styles.recipientDetail}>
          <EditableField
            value={recipientTitle}
            onChange={setRecipientTitle}
            fieldName="recipientTitle"
            className=""
            editingField={editingField}
            setEditingField={setEditingField}
          />
        </p>
        <p className={styles.recipientDetail}>
          <EditableField
            value={companyName}
            onChange={setCompanyName}
            fieldName="companyName"
            className=""
            editingField={editingField}
            setEditingField={setEditingField}
          />
        </p>
        <p className={styles.recipientDetail}>
          <EditableField
            value={companyLocation}
            onChange={setCompanyLocation}
            fieldName="companyLocation"
            className=""
            editingField={editingField}
            setEditingField={setEditingField}
          />
        </p>
        <p className={styles.recipientAddress}>
          <EditableField
            value={placeOfAssignment}
            onChange={setPlaceOfAssignment}
            fieldName="placeOfAssignment"
            className=""
            editingField={editingField}
            setEditingField={setEditingField}
          />
        </p>
      </div>
    </>
  );
}

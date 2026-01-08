// src/app/(user)/profile/components/sections/ViewIdSection.tsx
"use client";
import React from "react";
import styles from "./ViewIdSection.module.css";
import VerifiedIdManager from "@/components/verified-id/VerifiedIdManager";

export const ViewIdSection: React.FC = () => {
  return (
    <div className={styles.container}>
      <VerifiedIdManager showSubmitButton={false} readOnly={false} />
    </div>
  );
};

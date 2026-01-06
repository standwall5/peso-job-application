"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import styles from "./email-change-success.module.css";

export default function EmailChangeSuccessPage() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconSuccess}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2>Email Successfully Changed!</h2>
        <p className={styles.successMessage}>Your email address has been updated successfully. You can now use your new email to log in.</p>
        <div className={styles.noteBox}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <p>Your account is now fully updated. You may need to log in again with your new email address.</p>
        </div>
        <Button variant="success" onClick={() => router.push("/profile")}>Go to Profile</Button>
      </div>
    </div>
  );
}

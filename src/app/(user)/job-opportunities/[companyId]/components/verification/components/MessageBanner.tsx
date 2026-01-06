// Message banner component
import React from "react";
import { Message } from "../types";
import styles from "../VerifiedIdUpload.module.css";

interface MessageBannerProps {
  message: Message;
}

export function MessageBanner({ message }: MessageBannerProps) {
  return (
    <div
      className={`${styles.message} ${
        message.type === "success"
          ? styles.messageSuccess
          : styles.messageError
      }`}
    >
      <div className={styles.messageIcon}>
        {message.type === "success" ? "✓" : "!"}
      </div>
      <p className={styles.messageText}>{message.text}</p>
    </div>
  );
}

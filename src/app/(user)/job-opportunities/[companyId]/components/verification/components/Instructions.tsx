// Instructions component
import React from "react";
import styles from "../VerifiedIdUpload.module.css";

export function Instructions() {
  return (
    <div className={styles.instructions}>
      <h3 className={styles.instructionsTitle}>📋 Important Instructions</h3>
      <ul className={styles.instructionsList}>
        <li>
          Upload clear, high-quality images of the front and back of your valid
          government-issued ID
        </li>
        <li>
          Take a selfie holding the same ID next to your face with both your face
          and the ID clearly visible
        </li>
        <li>Ensure all text on your ID is readable and not blurred</li>
        <li>
          Only image files (PNG, JPG, JPEG) are accepted, up to 10MB each
        </li>
        <li>
          Your information will be kept secure and used only for verification
          purposes
        </li>
      </ul>
    </div>
  );
}

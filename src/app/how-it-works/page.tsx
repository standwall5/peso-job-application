import React from "react";
import styles from "./How.module.css";

const HowItWorks = () => {
  return (
    <div className={styles.howContainer}>
      <div className={styles.coachingContainer}>
        <h2>Employment Coaching</h2>
        <div className={styles.coachingContent}>Place content here</div>
      </div>
      <div className={styles.tutorialContainer}>
        <h2>Video Tutorial</h2>
        <div className={styles.tutorialContent}>
          <div>Place video here</div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
